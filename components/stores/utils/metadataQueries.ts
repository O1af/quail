export const pgMeta = `SELECT 
    t.table_schema,
    t.table_name,
    t.table_type,
    c.column_name,
    c.ordinal_position,
    c.data_type,
    c.character_maximum_length,
    c.numeric_precision,
    c.column_default,
    c.is_nullable,
    c.is_identity,
    c.identity_generation,
    -- For columns with a default (or generated) expression, show the extra info:
    pg_get_expr(d.adbin, d.adrelid) AS extra,
    -- Get the column comment (if any)
    col_description(pgc.oid, c.ordinal_position) AS column_comment,
    -- Is this column part of the primary key?
    EXISTS (
      SELECT 1 
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
       AND tc.table_schema = kcu.table_schema
      WHERE tc.table_schema = t.table_schema
        AND tc.table_name = t.table_name
        AND tc.constraint_type = 'PRIMARY KEY'
        AND kcu.column_name = c.column_name
    ) AS is_primary,
    -- Is this column constrained as UNIQUE?
    EXISTS (
      SELECT 1 
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
       AND tc.table_schema = kcu.table_schema
      WHERE tc.table_schema = t.table_schema
        AND tc.table_name = t.table_name
        AND tc.constraint_type = 'UNIQUE'
        AND kcu.column_name = c.column_name
    ) AS is_unique,
    -- Is this column a FOREIGN KEY?
    EXISTS (
      SELECT 1 
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
       AND tc.table_schema = kcu.table_schema
      WHERE tc.table_schema = t.table_schema
        AND tc.table_name = t.table_name
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = c.column_name
    ) AS is_foreign_key,
    -- If a foreign key, show the referenced table (if any)
    (
      SELECT ccu.table_name 
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
       AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage ccu 
        ON tc.constraint_name = ccu.constraint_name
       AND tc.table_schema = ccu.table_schema
      WHERE tc.table_schema = t.table_schema
        AND tc.table_name = t.table_name
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = c.column_name
      LIMIT 1
    ) AS referenced_table,
    -- If a foreign key, show the referenced column (if any)
    (
      SELECT ccu.column_name 
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
       AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage ccu 
        ON tc.constraint_name = ccu.constraint_name
       AND tc.table_schema = ccu.table_schema
      WHERE tc.table_schema = t.table_schema
        AND tc.table_name = t.table_name
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = c.column_name
      LIMIT 1
    ) AS referenced_column,
    -- Get the table’s comment (if any)
    obj_description(pgc.oid, 'pg_class') AS table_comment,
    -- Aggregated index metadata: list index names that include this column.
    (
      SELECT array_agg(idx.index_name)
      FROM (
        SELECT idx.indexrelid::regclass::text AS index_name
        FROM pg_index idx
        JOIN pg_attribute att 
          ON att.attrelid = idx.indrelid 
         AND att.attnum = ANY(idx.indkey)
        WHERE idx.indrelid = pgc.oid
          AND att.attname = c.column_name
      ) idx
    ) AS indexes,
    -- Aggregated check constraints defined on this column.
    (
      SELECT array_agg(pg_get_constraintdef(pc.oid))
      FROM pg_constraint pc
      JOIN pg_attribute pa 
        ON pa.attrelid = pc.conrelid 
       AND pa.attnum = ANY(pc.conkey)
      WHERE pc.conrelid = pgc.oid
        AND pc.contype = 'c'
        AND pa.attname = c.column_name
    ) AS check_constraints
FROM 
    information_schema.tables t
JOIN 
    information_schema.columns c 
      ON t.table_schema = c.table_schema 
     AND t.table_name = c.table_name
-- Join pg_class to retrieve comments and default expressions.
JOIN 
    pg_class pgc 
      ON pgc.relname = t.table_name 
     AND pgc.relnamespace = (
         SELECT oid 
         FROM pg_namespace 
         WHERE nspname = t.table_schema
       )
LEFT JOIN 
    pg_catalog.pg_attrdef d 
      ON d.adrelid = pgc.oid 
     AND d.adnum = c.ordinal_position
WHERE 
    t.table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY 
    t.table_schema, t.table_name, c.ordinal_position;`;

export const mysqlMeta = `SELECT 
  t.table_schema,
  t.table_name,
  t.table_type,
  c.column_name,
  c.ordinal_position,
  c.data_type,
  c.character_maximum_length,
  c.numeric_precision,
  c.column_default,
  c.is_nullable,
  -- In MySQL, auto_increment in the extra field signals an identity column.
  CASE 
    WHEN c.extra LIKE '%auto_increment%' THEN 1 
    ELSE 0 
  END AS is_identity,
  CASE 
    WHEN c.extra LIKE '%auto_increment%' THEN 'auto_increment' 
    ELSE NULL 
  END AS identity_generation,
  c.column_comment,
  -- Determine if this column is part of the primary key.
  CASE 
    WHEN c.column_key = 'PRI' THEN 1 
    ELSE 0 
  END AS is_primary,
  -- Determine if this column is defined as UNIQUE (non-PK unique key).
  CASE 
    WHEN c.column_key = 'UNI' THEN 1 
    ELSE 0 
  END AS is_unique,
  -- Determine if the column is a foreign key by checking key usage.
  (
    SELECT COUNT(*) 
    FROM information_schema.key_column_usage kcu
    WHERE kcu.table_schema = c.table_schema
      AND kcu.table_name = c.table_name
      AND kcu.column_name = c.column_name
      AND kcu.referenced_table_name IS NOT NULL
  ) > 0 AS is_foreign_key,
  -- If a foreign key exists, retrieve the referenced table name.
  (
    SELECT kcu.referenced_table_name
    FROM information_schema.key_column_usage kcu
    WHERE kcu.table_schema = c.table_schema
      AND kcu.table_name = c.table_name
      AND kcu.column_name = c.column_name
      AND kcu.referenced_table_name IS NOT NULL
    LIMIT 1
  ) AS referenced_table,
  -- Retrieve the referenced column name if this column is a foreign key.
  (
    SELECT kcu.referenced_column_name
    FROM information_schema.key_column_usage kcu
    WHERE kcu.table_schema = c.table_schema
      AND kcu.table_name = c.table_name
      AND kcu.column_name = c.column_name
      AND kcu.referenced_column_name IS NOT NULL
    LIMIT 1
  ) AS referenced_column,
  -- Aggregate index names (from information_schema.statistics) that include this column.
  (
    SELECT GROUP_CONCAT(DISTINCT s.index_name SEPARATOR ', ')
    FROM information_schema.statistics s
    WHERE s.table_schema = c.table_schema
      AND s.table_name = c.table_name
      AND s.column_name = c.column_name
  ) AS indexes,
  -- Aggregate check constraints for this column (if any). This is heuristic;
  -- it looks for check clauses that mention the column name.
  (
    SELECT GROUP_CONCAT(cc.check_clause SEPARATOR '; ')
    FROM information_schema.check_constraints cc
    JOIN information_schema.table_constraints tc 
      ON cc.constraint_name = tc.constraint_name 
     AND cc.constraint_schema = tc.constraint_schema
    WHERE tc.table_schema = c.table_schema
      AND tc.table_name = c.table_name
      AND tc.constraint_type = 'CHECK'
      AND cc.check_clause LIKE CONCAT('%', c.column_name, '%')
  ) AS check_constraints,
  t.table_comment
FROM 
  information_schema.tables t
JOIN 
  information_schema.columns c 
    ON t.table_schema = c.table_schema
   AND t.table_name = c.table_name
WHERE 
  t.table_schema NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys')
ORDER BY 
  t.table_schema, t.table_name, c.ordinal_position;`;
