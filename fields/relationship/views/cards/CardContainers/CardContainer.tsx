/** @jsxRuntime classic */
/** @jsx jsx */

import { type ReactNode } from "react";
import { Box, type BoxProps, forwardRefWithAs, jsx, useTheme } from "@keystone-ui/core";

type CardContainerProps = {
  children: ReactNode;
  mode: "view" | "create" | "edit";
} & BoxProps;

const CardContainer = forwardRefWithAs(({ mode = "view", ...props }: CardContainerProps, ref) => {
  const { tones } = useTheme();

  const tone = tones[mode === "edit" ? "active" : mode === "create" ? "positive" : "passive"];

  return (
    <Box
      ref={ref}
      paddingLeft="xlarge"
      css={{
        position: "relative",
        ":before": {
          content: '" "',
          backgroundColor: tone.border,
          borderRadius: 4,
          width: 4,
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1,
        },
      }}
      {...props}
    />
  );
});

export default CardContainer;
