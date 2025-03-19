"use client";
import React, { useEffect, useState, memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface CustomJsxParserProps {
  jsx: string;
  components: Record<string, any>;
  bindings: Record<string, any>;
  onError?: (error: Error) => void;
}

const CustomJsxParser: React.FC<CustomJsxParserProps> = ({
  jsx,
  components,
  bindings,
  onError,
}) => {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(
    null
  );

  useEffect(() => {
    async function compileJSX() {
      if (!jsx) {
        return;
      }

      try {
        // Import Babel only when needed
        const { default: Babel } = await import("@babel/standalone");

        // Transpile JSX to JavaScript
        const { code } = Babel.transform(jsx, { presets: ["react"] }) || {};

        if (!code) {
          throw new Error("Transpilation failed");
        }

        // Create component function with required dependencies
        const componentFn = new Function(
          "React",
          "components",
          `${code}; return ChartComponent;`
        );

        // Create the component with React and chart components
        const ChartComponent = componentFn(React, components);

        // Create a wrapper that passes bindings as props
        const WrappedComponent = () => (
          <ChartComponent {...bindings} components={components} />
        );

        setComponent(() => WrappedComponent);
      } catch (error) {
        console.error("JSX parsing error:", error);
        onError?.(error instanceof Error ? error : new Error(String(error)));
      }
    }

    compileJSX();
  }, [jsx, components, bindings, onError]);

  return Component ? <Component /> : <Skeleton className="h-full" />;
};

export default memo(CustomJsxParser);
