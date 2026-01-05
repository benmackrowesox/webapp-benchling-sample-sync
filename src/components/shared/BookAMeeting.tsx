import Box from "@mui/system/Box";
import { useEffect, useState } from "react";
import { PopupWidget } from "react-calendly";
import useTheme from "@mui/system/useTheme";
import { useMounted } from "src/hooks/use-mounted";

interface BookAMeetingProps {
  rootElementId: string;
  calendlyUrl: string;
  displayButton?: boolean;
  displayWidget?: boolean;
}

export const BookAMeeting = (props: BookAMeetingProps) => {
  const { rootElementId, calendlyUrl, displayButton, displayWidget } = props;
  const theme = useTheme();
  const isMounted = useMounted();
  const [root, setRoot] = useState<any>();

  useEffect(() => {
    if (isMounted()) {
      setRoot(document.getElementById(rootElementId));
    }
  }, []);

  if (!root) {
    return <></>;
  }
  return (
    root && (
      <>
        {(displayWidget ?? true) && (
          <PopupWidget
            url={calendlyUrl}
            text={"Book a meeting"}
            color={theme.palette.primary.main}
            rootElement={root}
          />
        )}
        {(displayButton ?? true) && (
          <Box>
            <a href="/contact">
              <Box
                sx={{
                  color: "white",
                  backgroundColor: "#00000077",
                  border: "2px solid white",
                  borderRadius: "3px",
                  padding: "10px 20px",
                  ...(theme.typography as any).body2,
                  fontWeight: 600,
                  cursor: "pointer",
                  ":hover": {
                    borderWidth: "2px",
                    backgroundColor: "#000000bb",
                    border: "2px solid white",
                  },
                }}
              >
                Learn more
              </Box>
            </a>
          </Box>
        )}
      </>
    )
  );
};
