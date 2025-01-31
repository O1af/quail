import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "next-themes";

export function ChatCard() {
  const [userText, setUserText] = useState("");
  const [sqlQuery, setSqlQuery] = useState("");
  const [isUserTypingDone, setIsUserTypingDone] = useState(false);
  const { theme } = useTheme();
  const avatarSrc = theme === "dark" ? "/boticondark.png" : "/boticonlight.png";
  const fullUserText = "Count orders by product type";
  const fullSqlQuery = `SELECT product_type,
    COUNT(*) as total_orders
FROM order_items
GROUP BY product_type
ORDER BY total_orders DESC`;

  const formatSqlWithHighlighting = (sql: string) => {
    const keywords = {
      blue: ["SELECT", "FROM", "WHERE", "GROUP BY", "ORDER BY", "DESC", "as"],
      purple: ["COUNT"],
      green: ["'active'"],
    };

    let formattedSql = sql;
    keywords.blue.forEach((keyword) => {
      formattedSql = formattedSql.replace(
        new RegExp(`\\b${keyword}\\b`, "g"),
        `<span class="text-blue-500">${keyword}</span>`
      );
    });
    keywords.purple.forEach((keyword) => {
      formattedSql = formattedSql.replace(
        new RegExp(`\\b${keyword}\\b`, "g"),
        `<span class="text-purple-500">${keyword}</span>`
      );
    });
    keywords.green.forEach((keyword) => {
      formattedSql = formattedSql.replace(
        keyword,
        `<span class="text-green-500">${keyword}</span>`
      );
    });

    return formattedSql;
  };

  useEffect(() => {
    let userIndex = 0;
    let sqlIndex = 0;
    let typingTimer: NodeJS.Timeout;

    const typeCharacter = () => {
      if (userIndex < fullUserText.length) {
        setUserText(fullUserText.slice(0, userIndex + 1));
        userIndex++;
      } else if (!isUserTypingDone) {
        setIsUserTypingDone(true);
        // Add delay before starting SQL typing
        setTimeout(() => {
          typingTimer = setInterval(() => {
            if (sqlIndex < fullSqlQuery.length) {
              setSqlQuery(fullSqlQuery.slice(0, sqlIndex + 1));
              sqlIndex++;
            } else {
              clearInterval(typingTimer);
            }
          }, 40);
        }, 1000);
        return;
      }

      if (!isUserTypingDone) {
        typingTimer = setTimeout(typeCharacter, 40);
      }
    };

    typingTimer = setTimeout(typeCharacter, 40);

    return () => {
      clearTimeout(typingTimer);
    };
  }, []);

  return (
    <div className="h-[200px] space-y-4">
      <Card className="border-0 bg-muted/50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/20">U</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="rounded-md bg-card p-3">
                {userText || " "}
                {userText.length < fullUserText.length && (
                  <span className="animate-pulse">|</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {sqlQuery && (
        <Card className="border-0 bg-muted/50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatarSrc} alt="QuailAI" />
              </Avatar>
              <div className="flex-1">
                <div
                  className="rounded-md bg-primary/10 p-3 font-mono text-sm whitespace-pre"
                  dangerouslySetInnerHTML={{
                    __html:
                      formatSqlWithHighlighting(sqlQuery) +
                      (sqlQuery.length < fullSqlQuery.length
                        ? '<span class="animate-pulse">|</span>'
                        : ""),
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
