import { useEffect, useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { Button, Modal, Typography } from "@mui/material";
import { MainLayout } from "../components/main-layout";
import { gtm } from "../lib/client/gtm";
import { Hero, HeroStandardContents } from "src/components/hero";
import { CenterTextSection } from "src/components/shared/Section";
import { BookAMeeting } from "src/components/shared/BookAMeeting";
import { CarouselCard } from "src/components/shared/Carousel";
import { Carousel } from "src/components/shared/Carousel";
import { Testimonials } from "src/components/shared/Testimonials";
import { Testimonial } from "src/components/shared/Testimonials";
import { CaptionIcon } from "src/components/shared/CaptionIcons";
import { FlipCard } from "src/components/shared/FlipCard";
import { BlockCards } from "src/components/shared/BlockCards";
import { TextAndImageSection } from "src/components/shared/TextAndImageSection";
import { Section } from "src/components/shared/Section";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import Container from "@mui/system/Container";
import Box from "@mui/system/Box";
import Stack from "@mui/system/Stack";
import { calendlyConfig } from "src/public-config";

const TimelineSection = () => (
  <Timeline position="alternate" sx={{ mt: -15 }}>
    <TimelineItem>
      <TimelineSeparator>
        <TimelineDot />
        <TimelineConnector />
      </TimelineSeparator>
      <TimelineContent>
        <Typography variant="h5">Detect</Typography>
        <Typography variant="caption">
          Identify any organism residing on your farm
        </Typography>
      </TimelineContent>
    </TimelineItem>
    <TimelineItem>
      <TimelineSeparator>
        <TimelineDot />
        <TimelineConnector />
      </TimelineSeparator>
      <TimelineContent>
        <Typography variant="h5">Classify</Typography>
        <Typography variant="caption">
          Describe the uncharacterised majority of microbes and quantify their
          threat
        </Typography>
      </TimelineContent>
    </TimelineItem>
    <TimelineItem>
      <TimelineSeparator>
        <TimelineDot />
        <TimelineConnector />
      </TimelineSeparator>
      <TimelineContent>
        <Typography variant="h5">Learn</Typography>
        <Typography variant="caption">
          Associate each organism with disease in your livestock
        </Typography>
      </TimelineContent>
    </TimelineItem>
    <TimelineItem>
      <TimelineSeparator>
        <TimelineDot />
      </TimelineSeparator>
      <TimelineContent>
        <Typography variant="h5">Develop</Typography>
        <Typography variant="caption">
          Build custom tools and prevention strategies unique to your farm
        </Typography>
      </TimelineContent>
    </TimelineItem>
  </Timeline>
);

const Home: NextPage = () => {
  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  return (
    <>
      <Head>
        <title>Esox Biologics</title>
      </Head>
      <main id="mainRoot">
        <Hero image="/home/home-hero.png">
          <HeroStandardContents
            title={
              <>
                Detect<span style={{ color: "gold" }}>. </span>
                Predict<span style={{ color: "gold" }}>. </span>
                Prevent<span style={{ color: "gold" }}>. </span>
              </>
            }
            subtitle={"Disease prevention specialists from hatchery to harvest"}
            heroAction={
              calendlyConfig.calendlyUrl ? (
                <BookAMeeting
                  calendlyUrl={calendlyConfig.calendlyUrl}
                  rootElementId={"mainRoot"}
                />
              ) : (
                <></>
              )
            }
          />
        </Hero>
        <Stack gap={15} sx={{ mt: 10 }}>
          <TextAndImageSection
            title="Our solutions are tailored to your farm's needs"
            headline="We help you to understand your aquatic environment, reduce disease outbreaks, and improve aquatic welfare"
            image="/home/home-s2-image.png"
            columnSplit="title"
            body=""
          ></TextAndImageSection>
          <Container maxWidth="lg" sx={{ mt: -15 }}>
            <BlockCards>
              <FlipCard title="Detect" image="/home/detect-logo.png">
                <ul style={{ listStyleType: "none", margin: 0, padding: 0 }}>
                  <li>Resolution of aquatic microbiomes</li>
                  <li>
                    <hr />
                  </li>
                  <li>Identification of potential pathogens</li>
                  <li>
                    <hr />
                  </li>
                  <li>Early detection before disease onset</li>
                </ul>
              </FlipCard>
              <FlipCard title="Predict" image="/home/predict-logo.png">
                <ul style={{ listStyleType: "none", margin: 0, padding: 0 }}>
                  <li>Total surveillance of your farm</li>
                  <li>
                    <hr />
                  </li>
                  <li>Unique microbiome data for disease prediction models</li>
                  <li>
                    <hr />
                  </li>
                  <li>Actionable insights straight to your mobile device</li>
                </ul>
              </FlipCard>
              <FlipCard title="Prevent" image="/home/prevent-logo.png">
                <ul style={{ listStyleType: "none", margin: 0, padding: 0 }}>
                  <li>
                    Targeted remedies that prevent the transmission of pathogens
                  </li>
                  <li>
                    <hr />
                  </li>
                  <li>Support your livestock's immune system</li>
                  <li>
                    <hr />
                  </li>
                  <li>
                    Sustainable prebiotics that reduce the use of antibiotics
                  </li>
                </ul>
              </FlipCard>
            </BlockCards>
          </Container>

          <CenterTextSection
            title="We know what's harming your livestock"
            headline="More than ninety percent of aquatic microbes are unclassified, but we're changing that"
          >
            We are using cutting-edge science to identify and characterise every
            aquatic microorganism. Why? Because microbes maintain healthy
            ecosystems and healthy livestock, but an imbalance in beneficial
            microbes presents opportunities for pathogens to emerge, invade and
            spread. We reveal the secrets of aquatic microbiomes to develop
            precision diagnostics and sustainable remedies that prevent the
            spread of infectious disease in aquaculture, improving yields by
            improving welfare.
            <br />
            <Box maxWidth="sm" marginX={"auto"}>
              <img width="100%" src="/home/home-s3.png" />
            </Box>
          </CenterTextSection>
          <TextAndImageSection
            title="The key to your farm's health is in the microbiome"
            imageFirst={true}
            columnSplit="title"
            headline={
              <>Improve animal welfare and increase your productivity</>
            }
            image="/home/home-s4.png"
            body={
              <Box
                sx={{
                  fontWeight: 500,
                  ul: {
                    listStyleImage: "url(/detect/detect-s2.png)",
                    marginLeft: "20px",
                  },
                  span: { top: "-20px", position: "relative" },
                }}
              >
                We can help you:
                <ul>
                  <li>
                    <span>Track the health of your aquatic environment</span>
                  </li>
                  <li>
                    <span>Detect troublesome pathogens</span>
                  </li>
                  <li>
                    <span>Prevent future disease outbreaks</span>
                  </li>
                  <li>
                    <span>Prevent livestock losses</span>
                  </li>
                </ul>
              </Box>
            }
          />
          <Carousel
            title="Tailor made and unique to your farm"
            headline="A new era for disease management in aquaculture"
            height="450px"
          >
            <CarouselCard
              icon="/home/home-s5.1.png"
              title="Control disease risk"
              invertColour={false}
            >
              Unrivalled insights into your farm's unique microbiome.
            </CarouselCard>
            <CarouselCard
              icon="/home/home-s5.2.png"
              title="Protect farm health"
            >
              Targeted remedies that support livestock immunity and prevent
              infections.
            </CarouselCard>
            <CarouselCard
              icon="/home/home-s5.3.png"
              title="Improve farm yields"
              invertColour={false}
            >
              By preventing disease, we improve livestock welfare which sustains
              growth and improves yields.
            </CarouselCard>
            <CarouselCard
              icon="/home/home-s5.4.png"
              title="Improve aquatic welfare"
            >
              Non-intrusive solutions with sustainability at heart.
            </CarouselCard>
          </Carousel>
          <TextAndImageSection
            title="Say goodbye to the unknown"
            headline="We provide you with support every step of the way"
            body={`Our team are by your side while you strive to prevent disease outbreaks in your livestock.
          You will never worry about confusing data nor unclear solutions. Our end-to-end workflow ensures
          all your questions are answered and the solutions are right for you.`}
            image="/home/home-s6.png"
            columnSplit="title"
            imageSize="small"
          />

          <TimelineSection />

          <CenterTextSection
            title="Protect your farm's health"
            headline="Disease outbreak solutions for every environment"
          >
            <BlockCards size="full" style={{ mt: 0 }}>
              <CaptionIcon variant="dark" size="med" img="/home/home-s8.1.png">
                RAS
              </CaptionIcon>
              <CaptionIcon variant="dark" size="med" img="/home/home-s8.2.png">
                Flow-through
              </CaptionIcon>
              <CaptionIcon variant="dark" size="med" img="/home/home-s8.3.png">
                Open water
              </CaptionIcon>
            </BlockCards>
          </CenterTextSection>
          <TextAndImageSection
            title="All at your fingertips"
            headline="Access everything you need via our web app"
            body="Customise your experience within our web app to view the data that is relevant to you."
            image="/home/home-s9.png"
            columnSplit="headline"
            imageSize="small"
          />
          <Section
            title="Testimonials"
            headline="See what our customers have to say about us"
          >
            <Testimonials>
              <Testimonial
                from="Dr Andre Van, Health Manager at Kames Fish Farming"
                img="/home/home-s10.1.png"
              >
                The metagenomics service provided by Esox Biologics revealed
                just how little we know about the microbiomes occupying our
                waters. It provides the microbiological context we need to
                improve the welfare of our fish.
              </Testimonial>
              <Testimonial
                from="Dr Matt Metselaar CertAqVet, Owner of Aquatic Vets Limited"
                img="/home/home-s10.2.png"
              >
                Working with Esox Biologics is a pleasure. Their metagenomics
                service gave me insights that qPCR and histology data alone
                could not. Their ability to resolve total microbiomes greatly
                assists my ability to make diagnoses.
              </Testimonial>
            </Testimonials>
          </Section>
          <NewsLetter />
        </Stack>
      </main>
    </>
  );
};

const NewsLetter = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <TextAndImageSection
      headline={"Join the mailing list"}
      image="/static/mailingList.png"
      columnSplit="title"
      imageSize="small"
      title={""}
      body={
        <>
          Subscribe to our newsletter to make sure you don't miss anything.
          <Button
            fullWidth
            size="large"
            sx={{ mt: 2 }}
            variant="contained"
            onClick={handleOpen}
          >
            Subscribe
          </Button>
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box
              sx={{
                position: "absolute" as "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "80%",
                height: "80%",
                bgcolor: "background.paper",
                border: "2px solid #000",
                boxShadow: 24,
              }}
            >
              <iframe
                width="100%"
                height="100%"
                src="https://b077c2ab.sibforms.com/serve/MUIEALnLz9OuK-yiJ5NQWlw7xjYwaxmclemYRWIzoD81dMR0_etmCOlTb8WnsFtbs7DwYsSyAMO78PFb1tRTfGlxyEEE3Ipmd8Bf3kK7k7LzWj10qRPV-OPv0QxqddLZRhIRYxzDTLC8z3cpwJmpCDqN26q0hBy373aECyYhwjgF2975u4vkYu-cnZHPND8AgTFhhWNPt8TVdhzu"
                frameBorder={0}
                scrolling="auto"
                allowFullScreen={true}
                style={{
                  display: "block",
                  marginLeft: "auto",
                  marginRight: "auto",
                  maxWidth: "100%",
                }}
              />
            </Box>
          </Modal>
        </>
      }
    />
  );
};

Home.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default Home;
