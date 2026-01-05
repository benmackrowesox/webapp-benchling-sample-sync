import { useState } from "react";

export const SettingsButton = () => {
  const [open, setOpen] = useState<boolean>(false);

  const handleOpen = (): void => {
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
  };

  return (
    <>
      {/* <Tooltip title="Settings">
        <Fab
          color="primary"
          onClick={handleOpen}
          size="medium"
          sx={{
            bottom: 0,
            margin: (theme) => theme.spacing(4),
            position: "fixed",
            right: 0,
            zIndex: 1900,
          }}
        >
          <AdjustmentsIcon fontSize="small" />
        </Fab>
      </Tooltip>
      <SettingsDrawer onClose={handleClose} open={open} /> */}
    </>
  );
};
