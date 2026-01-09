import { useCallback, useEffect, useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { AdminGuard } from "../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import { useMounted } from "../../../hooks/use-mounted";
import { gtm } from "../../../lib/client/gtm";
import { useTypedAuth } from "src/hooks/use-auth";
import type { Organisation, OrganisationUser, OrganisationUserRole } from "src/types/organisation";

interface UserListItem {
  id: string;
  email: string | null;
  firstName: string;
  lastName: string;
  company: string | null;
}

interface OrganisationWithStats extends Organisation {
  userCount: number;
  projectCount: number;
}

const OrganisationsPage: NextPage = () => {
  const isMounted = useMounted();
  const { user, sendRequest } = useTypedAuth();
  const [organisations, setOrganisations] = useState<OrganisationWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organisation | null>(null);
  const [usersDialogOpen, setUsersDialogOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<OrganisationWithStats | null>(null);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<UserListItem[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [addUserForm, setAddUserForm] = useState<{
    selectedUser: UserListItem | null;
    role: OrganisationUserRole;
  }>({
    selectedUser: null,
    role: "member",
  });
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [addUserError, setAddUserError] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuOrgId, setMenuOrgId] = useState<string | null>(null);

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  const fetchOrganisations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await sendRequest<undefined, Organisation[]>("/api/organisations", "GET");
      if (!data) {
        setOrganisations([]);
        return;
      }

      // Get stats for each organisation
      const orgsWithStats = await Promise.all(
        data.map(async (org) => {
          let projectCount = 0;
          try {
            const projectsSnapshot = await sendRequest<undefined, any[]>(
              `/api/projects?organisationId=${org.id}`,
              "GET"
            );
            projectCount = projectsSnapshot?.length || 0;
          } catch (error) {
            console.error(`Error fetching projects for org ${org.id}:`, error);
          }

          return {
            ...org,
            userCount: org.users.length,
            projectCount,
          };
        })
      );

      if (isMounted()) {
        setOrganisations(orgsWithStats);
      }
    } catch (error) {
      console.error("Error fetching organisations:", error);
    } finally {
      setLoading(false);
    }
  }, [isMounted, sendRequest]);

  const fetchAllUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const users = await sendRequest<undefined, UserListItem[]>("/api/users/list", "GET");
      if (isMounted() && users) {
        setAllUsers(users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setUsersLoading(false);
    }
  }, [isMounted, sendRequest]);

  useEffect(() => {
    fetchOrganisations();
  }, [fetchOrganisations]);

  const handleOpenDialog = (org?: Organisation) => {
    if (org) {
      setEditingOrg(org);
      setFormData({
        name: org.name,
        description: org.description || "",
      });
    } else {
      setEditingOrg(null);
      setFormData({ name: "", description: "" });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingOrg(null);
    setFormData({ name: "", description: "" });
  };

  const handleSave = async () => {
    try {
      if (editingOrg) {
        await sendRequest(`/api/organisations/${editingOrg.id}`, "PATCH", formData);
      } else {
        await sendRequest("/api/organisations", "POST", formData);
      }
      handleCloseDialog();
      await fetchOrganisations();
    } catch (error) {
      console.error("Error saving organisation:", error);
    }
  };

  const handleDelete = async (orgId: string) => {
    if (!confirm("Are you sure you want to archive this organisation?")) {
      return;
    }
    
    try {
      await sendRequest(`/api/organisations/${orgId}`, "DELETE");
      await fetchOrganisations();
    } catch (error) {
      console.error("Error archiving organisation:", error);
    }
  };

  const handleViewUsers = (org: OrganisationWithStats) => {
    setSelectedOrg(org);
    setUsersDialogOpen(true);
    setMenuAnchor(null);
  };

  const handleOpenAddUser = (org: OrganisationWithStats) => {
    setSelectedOrg(org);
    setAddUserForm({ selectedUser: null, role: "member" });
    setAddUserDialogOpen(true);
    setMenuAnchor(null);
    fetchAllUsers();
  };

  const handleCloseAddUser = () => {
    setAddUserDialogOpen(false);
    setSelectedOrg(null);
    setAddUserForm({ selectedUser: null, role: "member" });
    setAddUserError(null);
  };

  const handleAddUser = async () => {
    if (!selectedOrg || !addUserForm.selectedUser || !addUserForm.selectedUser.email) {
      return;
    }

    setAddUserLoading(true);
    setAddUserError(null);

    try {
      await sendRequest(`/api/organisations/${selectedOrg.id}`, "POST", {
        userId: addUserForm.selectedUser.id,
        email: addUserForm.selectedUser.email,
        role: addUserForm.role,
      });
      await fetchOrganisations();
      // Refresh selected org data
      const updatedOrg = organisations.find((o) => o.id === selectedOrg.id);
      if (updatedOrg) {
        setSelectedOrg({ ...updatedOrg, userCount: updatedOrg.users.length + 1 });
      }
      handleCloseAddUser();
    } catch (error: any) {
      console.error("Error adding user:", error);
      setAddUserError(error?.message || "Failed to add user. Please try again.");
    } finally {
      setAddUserLoading(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!selectedOrg || !confirm("Are you sure you want to remove this user from the organisation?")) {
      return;
    }

    try {
      await sendRequest(`/api/organisations/${selectedOrg.id}?userId=${userId}`, "DELETE");
      await fetchOrganisations();
      // Refresh selected org data
      const updatedOrg = organisations.find((o) => o.id === selectedOrg.id);
      if (updatedOrg) {
        setSelectedOrg({ ...updatedOrg, userCount: updatedOrg.users.length - 1 });
      }
    } catch (error) {
      console.error("Error removing user:", error);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, orgId: string) => {
    setMenuAnchor(event.currentTarget);
    setMenuOrgId(orgId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuOrgId(null);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getRoleColor = (role: OrganisationUserRole): "success" | "info" | "default" | "warning" => {
    switch (role) {
      case "owner":
        return "warning";
      case "admin":
        return "info";
      case "member":
        return "success";
      case "viewer":
        return "default";
      default:
        return "default";
    }
  };

  // Get users not already in the organisation
  const getAvailableUsers = () => {
    if (!selectedOrg) return allUsers;
    const existingUserIds = new Set(selectedOrg.users.map((u) => u.userId));
    return allUsers.filter((u) => !existingUserIds.has(u.id));
  };

  const getUserOptionLabel = (option: UserListItem | string) => {
    if (typeof option === "string") return option;
    const name = `${option.firstName} ${option.lastName}`.trim();
    return option.email || name || option.id;
  };

  const isUserAlreadyInOrg = (userId: string) => {
    if (!selectedOrg) return false;
    return selectedOrg.users.some((u) => u.userId === userId);
  };

  return (
    <>
      <Head>
        <title>Organisations | Esox Biologics</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
            <Typography variant="h4">Organisations</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              New Organisation
            </Button>
          </Box>

          {loading ? (
            <Typography>Loading...</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Users</TableCell>
                    <TableCell>Projects</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {organisations.map((org) => (
                    <TableRow key={org.id}>
                      <TableCell>
                        <Typography variant="body1" fontWeight={500}>
                          {org.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="textSecondary">
                          {org.description || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>{org.userCount}</TableCell>
                      <TableCell>{org.projectCount}</TableCell>
                      <TableCell>{formatDate(org.createdAt)}</TableCell>
                      <TableCell>
                        <Chip
                          label={org.isActive ? "Active" : "Archived"}
                          color={org.isActive ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleViewUsers(org)}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(org)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(org.id)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {organisations.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body2" color="textSecondary" sx={{ py: 4 }}>
                          No organisations yet. Create your first organisation to get started.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Container>
      </Box>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingOrg ? "Edit Organisation" : "Create Organisation"}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="Organisation Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!formData.name.trim()}
          >
            {editingOrg ? "Save Changes" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Users Dialog */}
      <Dialog open={usersDialogOpen} onClose={() => setUsersDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Organisation Users
          {selectedOrg && ` - ${selectedOrg.name}`}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenAddUser(selectedOrg!)}
            >
              Add User
            </Button>
          </Box>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedOrg?.users.map((user) => (
                  <TableRow key={user.userId}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        color={getRoleColor(user.role)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(user.joinedAt)}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveUser(user.userId)}
                        color="error"
                        disabled={user.role === "owner"}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {selectedOrg?.users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="textSecondary" sx={{ py: 2 }}>
                        No users in this organisation. Add users to get started.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUsersDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={addUserDialogOpen} onClose={handleCloseAddUser} maxWidth="sm" fullWidth>
        <DialogTitle>
          Add User to Organisation
          {selectedOrg && ` - ${selectedOrg.name}`}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 3 }}>
            <Autocomplete
              options={getAvailableUsers()}
              getOptionLabel={getUserOptionLabel}
              getOptionKey={(option) => option.id}
              value={addUserForm.selectedUser}
              onChange={(_, newValue) => {
                setAddUserForm({ ...addUserForm, selectedUser: newValue });
              }}
              loading={usersLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select User"
                  placeholder="Search by name or email"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {usersLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => {
                return (
                  <li key={option.id} {...props}>
                    <Box>
                      <Typography variant="body1">
                        {option.firstName} {option.lastName}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {option.email || "No email"} {option.company && `• ${option.company}`}
                      </Typography>
                    </Box>
                  </li>
                );
              }}
              noOptionsText={
                usersLoading
                  ? "Loading users..."
                  : getAvailableUsers().length === 0
                  ? "All users are already in this organisation"
                  : "No users found"
              }
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={addUserForm.role}
                label="Role"
                onChange={(e) => setAddUserForm({ ...addUserForm, role: e.target.value as OrganisationUserRole })}
              >
                <MenuItem value="admin">Admin - Can manage projects and samples</MenuItem>
                <MenuItem value="member">Member - Can submit samples</MenuItem>
                <MenuItem value="viewer">Viewer - Read-only access</MenuItem>
              </Select>
            </FormControl>
            {addUserError && (
              <Typography color="error" variant="body2">
                {addUserError}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddUser} disabled={addUserLoading}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddUser}
            disabled={!addUserForm.selectedUser || addUserLoading}
            startIcon={addUserLoading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {addUserLoading ? "Adding..." : "Add User"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

OrganisationsPage.getLayout = (page) => (
  <AdminGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AdminGuard>
);

export default OrganisationsPage;

