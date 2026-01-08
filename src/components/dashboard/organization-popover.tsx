import type { FC } from "react";
import { useCallback, useEffect, useState } from "react";
import { MenuItem, Popover, Typography, Box, Button, Divider, TextField } from "@mui/material";
import { useTypedAuth } from "src/hooks/use-auth";
import { organisationStore } from "src/lib/client/store/organisations";
import type { Organisation } from "src/types/organisation";

interface OrganizationPopoverProps {
  anchorEl: null | Element;
  onClose?: () => void;
  open?: boolean;
}

export const OrganizationPopover: FC<OrganizationPopoverProps> = (props) => {
  const { anchorEl, onClose, open, ...other } = props;
  const { user, sendRequest } = useTypedAuth();
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");

  const fetchOrganisations = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await sendRequest<undefined, Organisation[]>("/api/organisations", "GET");
      if (data) {
        setOrganisations(data);
      }
    } catch (error) {
      console.error("Error fetching organisations:", error);
    } finally {
      setLoading(false);
    }
  }, [user, sendRequest]);

  useEffect(() => {
    if (open) {
      fetchOrganisations();
    }
  }, [open, fetchOrganisations]);

  const handleChange = async (organisationId: string): Promise<void> => {
    onClose?.();
    // Store selected organisation in localStorage/context
    localStorage.setItem("selectedOrganisationId", organisationId);
    organisationStore.setSelectedOrganisation(organisationId);
    // Reload to apply changes
    window.location.reload();
  };

  const handleCreateOrganisation = async (): Promise<void> => {
    if (!newOrgName.trim() || !user) return;
    
    try {
      setLoading(true);
      await sendRequest("/api/organisations", "POST", {
        name: newOrgName.trim(),
      });
      
      setNewOrgName("");
      setShowCreateForm(false);
      await fetchOrganisations();
    } catch (error) {
      console.error("Error creating organisation:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get the organisation ID from the user's profile or localStorage
  const selectedOrgId = user?.organisationId || localStorage.getItem("selectedOrganisationId");

  if (!user?.isAdmin) {
    // Regular users see organisations they're members of
    const userOrganisations = organisations.filter((org) =>
      org.users.some((u) => u.userId === user?.id)
    );

    return (
      <Popover
        anchorEl={anchorEl}
        anchorOrigin={{
          horizontal: "left",
          vertical: "bottom",
        }}
        keepMounted
        onClose={onClose}
        open={!!open}
        PaperProps={{ sx: { width: 248, maxHeight: 400 } }}
        transitionDuration={0}
        {...other}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="textSecondary">
            Your Organisations
          </Typography>
        </Box>
        <Divider />
        {userOrganisations.length === 0 ? (
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="textSecondary">
              You are not a member of any organisation.
            </Typography>
          </Box>
        ) : (
          userOrganisations.map((organisation) => (
            <MenuItem
              key={organisation.id}
              onClick={() => handleChange(organisation.id)}
              selected={selectedOrgId === organisation.id}
            >
              <Box sx={{ py: 0.5 }}>
                <Typography variant="body1">{organisation.name}</Typography>
                <Typography variant="caption" color="textSecondary">
                  {organisation.users.length} members
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
      </Popover>
    );
  }

  // Admin users see all organisations and can create new ones
  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{
        horizontal: "left",
        vertical: "bottom",
      }}
      keepMounted
      onClose={onClose}
      open={!!open}
      PaperProps={{ sx: { width: 300, maxHeight: 500 } }}
      transitionDuration={0}
      {...other}
    >
      {!showCreateForm ? (
        <>
          <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="subtitle2">Organisations</Typography>
            <Button size="small" onClick={() => setShowCreateForm(true)}>
              New
            </Button>
          </Box>
          <Divider />
          <Box sx={{ maxHeight: 350, overflow: "auto" }}>
            {loading && organisations.length === 0 ? (
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Loading...
                </Typography>
              </Box>
            ) : organisations.length === 0 ? (
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  No organisations yet.
                </Typography>
              </Box>
            ) : (
              organisations.map((organisation) => (
                <MenuItem
                  key={organisation.id}
                  onClick={() => handleChange(organisation.id)}
                  selected={selectedOrgId === organisation.id}
                >
                  <Box sx={{ py: 0.5 }}>
                    <Typography variant="body1">{organisation.name}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {organisation.users.length} members
                      {!organisation.isActive && " (Archived)"}
                    </Typography>
                  </Box>
                </MenuItem>
              ))
            )}
          </Box>
        </>
      ) : (
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Create New Organisation
          </Typography>
          <TextField
            fullWidth
            size="small"
            label="Organisation Name"
            value={newOrgName}
            onChange={(e) => setNewOrgName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              onClick={handleCreateOrganisation}
              disabled={!newOrgName.trim() || loading}
            >
              Create
            </Button>
            <Button
              size="small"
              onClick={() => {
                setShowCreateForm(false);
                setNewOrgName("");
              }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      )}
    </Popover>
  );
};

