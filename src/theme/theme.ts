import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  styles: {
    global: {
      body: {
        backgroundColor: "gray.200",
        color: "gray.700",
      },
    },
  },
});
export default theme;
