import { useEffect, useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import NextLink from "next/link";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
} from "@mui/material";
import type { File } from "../../../components/file-dropzone";
import { FileDropzone } from "../../../components/file-dropzone";
import { ArrowLeft as ArrowLeftIcon } from "../../../icons/arrow-left";
import { gtm } from "../../../lib/client/gtm";
import { fileToBase64 } from "../../../utils/file-to-base64";
import { DashboardLayout } from "src/components/dashboard/dashboard-layout";
import { useRouter } from "next/router";
import { db, uploadBase64PDFToPublicFolder } from "src/lib/client/firebase";
import { doc, setDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import { opportunitiesStore } from "src/lib/client/store/opportunities";
import { AdminGuard } from "src/components/authentication/auth-guard";

const BlogPostCreate: NextPage = () => {
  const router = useRouter();
  const [pdfFile, setPdfFile] = useState<string | null>(null);

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  const handleDropCover = async ([file]: File[]) => {
    const data = (await fileToBase64(file)) as string;
    setPdfFile(data);
  };

  const handleRemove = (): void => {
    setPdfFile(null);
  };

  // editable by user
  const [name, setName] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [linkedin, setLinkedin] = useState<string>("");

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  async function publishChanges() {
    const newId = uuidv4();
    const newCover = await uploadBase64PDFToPublicFolder(pdfFile ?? "");
    const newPost = {
      id: newId,
      name,
      location,
      linkedin,
      pdfFile: newCover,
    };
    await setDoc(doc(db, "opportunity-posts", newId), newPost)
      .then((value) => {
        toast.success("Job updated");
      })
      .catch((reason) => {
        toast.error("Unable to update job");
      });
    opportunitiesStore.addPost(newPost);
    await router.push(`/dashboard/edit-jobs`);
  }

  return <>
    <Head>
      <title>Admin: New Job | Esox Biologics</title>
    </Head>
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        py: 8,
      }}
    >
      <Container maxWidth="md">
        <NextLink href="/dashboard/edit-jobs" passHref legacyBehavior>
          <Button
            component="a"
            startIcon={<ArrowLeftIcon fontSize="small" />}
          >
            Edit jobs
          </Button>
        </NextLink>
        <Card
          elevation={16}
          sx={{
            alignItems: "center",
            borderRadius: 1,
            display: "flex",
            justifyContent: "space-between",
            mb: 8,
            mt: 6,
            px: 3,
            py: 2,
          }}
        >
          <Typography variant="h5">New job</Typography>
          <div>
            <NextLink href="/dashboard/edit-jobs" passHref legacyBehavior>
              <Button
                component="a"
                sx={{
                  display: {
                    xs: "none",
                    sm: "inline-flex",
                  },
                  mr: 2,
                }}
                variant="outlined"
              >
                Cancel
              </Button>
            </NextLink>
            <Button
              component="a"
              sx={{
                display: {
                  xs: "none",
                  sm: "inline-flex",
                },
                mr: 2,
              }}
              variant="contained"
              onClick={publishChanges}
            >
              Publish new job
            </Button>
          </div>
        </Card>
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h5">Basic details</Typography>
            <Box sx={{ mt: 3 }}>
              <TextField
                fullWidth
                label="Job name"
                name="name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                }}
              />
              <Box sx={{ mt: 3 }}>
                <TextField
                  multiline
                  fullWidth
                  label="location"
                  value={location}
                  onChange={(event) => {
                    setLocation(event.target.value);
                  }}
                />
              </Box>
              <Box sx={{ mt: 3 }}>
                <TextField
                  multiline
                  fullWidth
                  label="Linkedin Link"
                  value={linkedin}
                  onChange={(event) => {
                    setLinkedin(event.target.value);
                  }}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h5">Job description pdf</Typography>
            <Box sx={{ mt: 3 }}>
              <Alert severity="info">
                <div>
                  {`Only upload pdf's, please try and compress the file as much
                  as possible first`}
                </div>
              </Alert>
            </Box>
            {pdfFile ? (
              <Box sx={{ mt: 3 }}>
                <Alert severity="success">
                  <div>PDF Uploaded</div>
                </Alert>
              </Box>
            ) : (
              <></>
            )}
            <Button onClick={handleRemove} sx={{ mt: 3 }} disabled={!pdfFile}>
              Remove pdf
            </Button>
            <Box sx={{ mt: 3 }}>
              <FileDropzone
                accept={{
                  "application/pdf": [],
                }}
                maxFiles={1}
                onDrop={handleDropCover}
              />
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  </>;
};

BlogPostCreate.getLayout = (page) => (
  <AdminGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AdminGuard>
);

export default BlogPostCreate;
