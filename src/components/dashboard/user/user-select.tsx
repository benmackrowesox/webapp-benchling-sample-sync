import { FC, useCallback, useEffect, useState } from "react";
import { useTypedAuth } from "src/hooks/use-auth";

import {
  Card,
  CardContent,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";

interface UserSummary {
  id: string;
  name: string;
}

export interface UserSelectProps {
  userId?: string;
  onSelectUser: (userId: string) => void;
}

export const UserSelect: FC<UserSelectProps> = ({ userId, onSelectUser }) => {
  const { user, sendRequest } = useTypedAuth();
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [selectedUserId, setSelectedUserId] = useState(userId ?? user?.id);

  const getUsers = useCallback(async () => {
    try {
      setUsers(await sendRequest("/api/users/users", "GET"));
    } catch (err) {
      console.error(err);
    }
  }, [sendRequest]);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const onUpdate = (newUserId: string) => {
    setSelectedUserId(newUserId);
    onSelectUser(newUserId);
  };

  if (!user?.isAdmin) {
    return <div />;
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ pb: 2 }}>
          Select client
        </Typography>
        <FormControl sx={{ minWidth: 280, mt: 2 }}>
          <InputLabel id="service-label">Client *</InputLabel>

          <Select
            value={users.length === 0 ? "" : selectedUserId}
            label="Client *"
            onChange={(e) => onUpdate(e.target.value)}
            labelId="user-id-label"
          >
            {users.map((aUser) => (
              <MenuItem key={aUser.id} value={aUser.id}>
                {aUser.name} {aUser.id === user?.id ? "(yourself)" : ""}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>Required</FormHelperText>
        </FormControl>
      </CardContent>
    </Card>
  );
};
