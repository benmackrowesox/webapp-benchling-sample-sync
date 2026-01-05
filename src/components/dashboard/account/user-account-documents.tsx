import { FC } from "react";
import { Typography } from "@mui/material";

import { useTypedAuth } from "src/hooks/use-auth";
import { USER_FOLDERS } from "src/lib/client/firebase";
import { FileManagement } from "src/components/dashboard/account/file-management";

import "react-phone-input-2/lib/style.css";

export const UserAccountDocuments: FC = (props) => {
  const { user } = useTypedAuth();

  if (!user?.id) {
    return <div />;
  }

  return (
    <FileManagement
      userId={user.id}
      title="Agreements and account documents"
      folderNames={[USER_FOLDERS.ACCOUNT_DOCUMENTS]}
      helpSection={
        <>
          <span>
            Keep all your important documents in one place. Upload agreements,
            contracts, and other relevant files to your account for easy access
            and management.
          </span>
          <Typography variant="body2" mt={2} color="primary">
            <strong>PRO TIP!</strong> Ensure your documents have recognisable
            names.
          </Typography>
        </>
      }
    />
  );
};
