import { ReactNode, useEffect, useRef, useState } from "react";
import type { FC } from "react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { Box, Divider, Drawer, useMediaQuery } from "@mui/material";
import type { Theme } from "@mui/material";

import { UserCircle as UserCircleIcon } from "../../icons/user-circle";
import { QuestionMark as QuestionMarkIcon } from "../../icons/question-mark";
import { Template as TemplateIcon } from "../../icons/template";

import LocalShipping from "@mui/icons-material/LocalShipping";
import Map from "@mui/icons-material/Map";
import { Logo } from "../logo";
import { Scrollbar } from "../scrollbar";
import { DashboardSidebarSection } from "./dashboard-sidebar-section";
import { OrganizationPopover } from "./organization-popover";
import { AdminGuard, ApprovedUserGuard } from "../authentication/auth-guard";
import { User } from "src/icons/user";
import Add from "@mui/icons-material/Add";
import PeopleIcon from "@mui/icons-material/People";
import SetMealIcon from "@mui/icons-material/SetMeal";
import { TestTubes as TestTubesIcon } from "src/icons/test-tubes";
import { Home as HomeIcon } from "src/icons/home";
import SyncIcon from "@mui/icons-material/Sync";

interface DashboardSidebarProps {
  onClose?: () => void;
  open?: boolean;
}

interface Item {
  title: string;
  children?: Item[];
  chip?: ReactNode;
  icon?: ReactNode;
  path?: string;
  newTab?: boolean;
}

interface Section {
  title: string;
  items: Item[];
}

const getAdminSections = (): Section[] => [
  {
    title: "Admin",
    items: [
      {
        title: "Benchling Samples",
        path: "/dashboard/admin/samples",
        icon: <SyncIcon fontSize="small" />,
      },
      {
        title: "Edit blogs",
        path: "/dashboard/edit-blogs",
        icon: <TemplateIcon fontSize="small" />,
      },
      {
        title: "Edit Jobs",
        path: "/dashboard/edit-jobs",
        icon: <User fontSize="small" />,
      },
      {
        title: "Edit Help Pages",
        path: "/dashboard/edit-help",
        icon: (
          <QuestionMarkIcon fontSize="small" sx={{ translate: "2px 2px" }} />
        ),
      },
      {
        title: "Approve New Users",
        path: "/dashboard/approve-users",
        icon: <User fontSize="small" />,
      },
      {
        title: "Clients",
        path: "/dashboard/users",
        icon: <PeopleIcon fontSize="small" />,
      },
      {
        title: "Configuration",
        path: "/dashboard/configuration",
        icon: <SetMealIcon fontSize="small" />,
      },
    ],
  },
];

const getUnapprovedUserSections = (): Section[] => [
  {
    title: "",
    items: [
      {
        title: "Review Questionnaire",
        icon: <Add fontSize="small" />,
        path: "/new-customer-questionnaire",
      },
    ],
  },
];
const getApprovedUserSections = (): Section[] => [
  {
    title: "Orders",
    items: [
      {
        title: "New Order",
        icon: <Add fontSize="small" />,
        path: "/dashboard/orders/request",
      },
      {
        title: "Orders",
        icon: <TestTubesIcon fontSize="small" />,
        path: "/dashboard/orders",
      },
      {
        title: "Embedded App",
        icon: <HomeIcon fontSize="small" />,
        path: "/dashboard/embedded-app",
      },
      // {
      //   title: "Completed Reports",
      //   icon: <ReportsIcon fontSize="small" />,
      //   path: "/dashboard/reports",
      // },
      // {
      //   title: "Comparisons",
      //   icon: <ArrowsCompareIcon fontSize="small" />,
      //   path: "/dashboard/comparisons",
      // },
    ],
  },
];

const getSections = (): Section[] => [
  {
    title: "Personal",
    items: [
      {
        title: "Dashboard",
        icon: <HomeIcon fontSize="small" />,
        path: "/dashboard",
      },

      {
        title: "Account",
        path: "/dashboard/account",
        icon: <UserCircleIcon fontSize="small" />,
      },
      {
        title: "Aquaculture Maps",
        path: "/dashboard/uk-aquaculture-map",
        icon: <Map fontSize="small" />,
      },
    ],
  },

  {
    title: "Help",
    items: [
      {
        title: "Help",
        path: "/help",
        icon: (
          <QuestionMarkIcon fontSize="small" sx={{ translate: "2px 2px" }} />
        ),
        newTab: true,
      },
      {
        title: "Sample Returns",
        path: "/dashboard/sample-returns",
        icon: <LocalShipping fontSize="small" />,
      },
    ],
  },
];

export const DashboardSidebar: FC<DashboardSidebarProps> = (props) => {
  const { onClose, open } = props;
  const router = useRouter();
  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up("lg"), {
    noSsr: true,
  });
  const sections = getSections();
  const approvedUserSections = getApprovedUserSections();
  const unapprovedUserSections = getUnapprovedUserSections();
  const adminSections = getAdminSections();
  const organizationsRef = useRef<HTMLButtonElement | null>(null);
  const [openOrganizationsPopover, setOpenOrganizationsPopover] =
    useState<boolean>(false);

  const handlePathChange = () => {
    if (!router.isReady) {
      return;
    }

    if (open) {
      onClose?.();
    }
  };

  useEffect(
    handlePathChange,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router.isReady, router.asPath],
  );

  const handleCloseOrganizationsPopover = (): void => {
    setOpenOrganizationsPopover(false);
  };

  const content = (
    <>
      <Scrollbar
        sx={{
          height: "100%",
          "& .simplebar-content": {
            height: "100%",
          },
        }}
      >
        <Box
          sx={{
            background: "003F4C",
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <div>
            <Box sx={{ p: 3 }}>
              <NextLink href="/" passHref>
                <Logo
                  variant="light"
                  sx={{
                    height: 50,
                    width: 100,
                  }}
                />
              </NextLink>
            </Box>
          </div>
          <Divider
            sx={{
              borderColor: "#2D3748", // dark divider
            }}
          />
          <Box sx={{ flexGrow: 1 }}>
            <AdminGuard>
              {adminSections.map((section, idx) => (
                <DashboardSidebarSection
                  key={!!section.title ? section.title : idx}
                  path={router.asPath}
                  sx={{
                    mt: 2,
                    "& + &": {
                      mt: 2,
                    },
                  }}
                  {...section}
                />
              ))}
            </AdminGuard>
            <ApprovedUserGuard
              guardFailedChildren={unapprovedUserSections.map(
                (section, idx) => (
                  <DashboardSidebarSection
                    key={!!section.title ? section.title : idx}
                    path={router.asPath}
                    sx={{
                      mt: 2,
                      "& + &": {
                        mt: 2,
                      },
                    }}
                    {...section}
                  />
                ),
              )}
            >
              {approvedUserSections.map((section, idx) => (
                <DashboardSidebarSection
                  key={!!section.title ? section.title : idx}
                  path={router.asPath}
                  sx={{
                    mt: 2,
                    "& + &": {
                      mt: 2,
                    },
                  }}
                  {...section}
                />
              ))}
            </ApprovedUserGuard>
            {sections.map((section, idx) => (
              <DashboardSidebarSection
                key={!!section.title ? section.title : idx}
                path={router.asPath}
                sx={{
                  mt: 6,
                  "& + &": {
                    mt: 2,
                  },
                }}
                {...section}
              />
            ))}
          </Box>
          <Divider
            sx={{
              borderColor: "#2D3748", // dark divider
            }}
          />
        </Box>
      </Scrollbar>
      <OrganizationPopover
        anchorEl={organizationsRef.current}
        onClose={handleCloseOrganizationsPopover}
        open={openOrganizationsPopover}
      />
    </>
  );

  if (lgUp) {
    return (
      <Drawer
        anchor="left"
        open
        PaperProps={{
          sx: {
            backgroundColor: "neutral.900",
            borderRightColor: "divider",
            borderRightStyle: "solid",
            borderRightWidth: (theme) =>
              theme.palette.mode === "dark" ? 1 : 0,
            color: "#FFFFFF",
            width: 280,
          },
        }}
        variant="permanent"
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Drawer
      anchor="left"
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: {
          backgroundColor: "neutral.900",
          color: "#FFFFFF",
          width: 280,
        },
      }}
      sx={{ zIndex: (theme) => theme.zIndex.appBar + 100 }}
      variant="temporary"
    >
      {content}
    </Drawer>
  );
};

DashboardSidebar.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
};
