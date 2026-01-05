import { useEffect } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { MainLayout } from "../components/main-layout";
import { gtm } from "../lib/client/gtm";
import { Hero, HeroStandardContents } from "src/components/hero";
import { CenterTextSection } from "src/components/shared/Section";
import { BookAMeeting } from "src/components/shared/BookAMeeting";
import { FaqSection } from "src/components/shared/FaqSection";
import { CarouselCard } from "src/components/shared/Carousel";
import { Carousel } from "src/components/shared/Carousel";
import { CaptionIcon } from "src/components/shared/CaptionIcons";
import { CaptionIcons } from "src/components/shared/CaptionIcons";
import { TextAndImageSection } from "src/components/shared/TextAndImageSection";
import { Section } from "src/components/shared/Section";
import Box, { BoxProps } from "@mui/system/Box";
import { EForesee } from "../components/eforesee";
import { calendlyConfig } from "src/public-config";
import Stack from "@mui/system/Stack";

const PREDICT_FAQS = [
  {
    key: "predict_faq_1",
    question: (
      <span>
        What can <EForesee /> tell me?
      </span>
    ),
    children: (
      <span>
        <EForesee /> indicates the health status of your farm: the water and the
        livestock.
      </span>
    ),
  },
  {
    key: "predict_faq_2",
    question: (
      <span>
        What actions can <EForesee /> yield?
      </span>
    ),
    children: (
      <span>
        <EForesee /> identifies crucial fluctuations in microbiomes that can
        increase the risk in disease outbreaks.
      </span>
    ),
  },
  {
    key: "predict_faq_3",
    question: (
      <span>
        What disease can <EForesee /> predict?
      </span>
    ),
    children: (
      <span>
        <EForesee /> is environment specific. Harmful algae and plankton blooms,
        biofilter crashes and opportunistic bacterial infections can all be
        anticipated with <EForesee />.
      </span>
    ),
  },
];

export const SpanBox = (props: BoxProps) => (
  <Box component={"span"} {...props} />
);
const Predict: NextPage = () => {
  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  return (
    <>
      <Head>
        <title>Predict | Esox Biologics</title>
      </Head>
      <main id="mainRoot">
        <Hero image="/predict/predict-hero.png">
          <HeroStandardContents
            title={
              <>Aquaculture's first ever disease prediction&nbsp;platform</>
            }
            subtitle={
              "Reveal the missing links in disease outbreaks and take preventative action earlier than ever before"
            }
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
          <CenterTextSection
            title={"We understand your farm like no one else"}
            headline={
              <>
                Data driven disease predictions unique to your farm with{" "}
                <EForesee />
              </>
            }
          >
            <>
              <EForesee /> monitors communities of aquatic microorganisms in
              unrivalled detail by leveraging the metagenomic data we collect.
              Fluctuations in microbiomes are correlated to production data and
              water quality indicators to reveal this missing link in disease
              outbreaks and offer foresight for health managers and
              veterinarians.
              <br />
              <img width="350px" src="/predict/predict-s2.png" />
            </>
          </CenterTextSection>

          <TextAndImageSection
            title="Your enemy is lurking in the shadows"
            headline="Regular monitoring of the aquatic microbiome is essential to protect your farm's health"
            image="/predict/predict-s3.png"
            imageSize="small"
            columnSplit="headline"
            body={
              <>
                Aquatic diseases manifest from an imbalance between livestock
                health, water quality and microbiomes. Aquatic microbiomes are
                complex and unexplored communities of microorganisms containing
                opportunistic pathogens that infect stressed livestock. Water
                quality and livestock health are constantly monitored but
                aquatic microbiomes are unresolved and pose a hidden threat to
                aquaculture.
              </>
            }
          />

          <TextAndImageSection
            title="Easily accessible data"
            headline="Insights at your fingertips"
            imageSize="large"
            imageFirst={true}
            image="/predict/predict-s4.png"
            columnSplit="title"
            body={
              <>
                <EForesee /> offers proactive health management insights
                straight to your phone. Big data is condensed into simple and
                effective actions to maintain the welfare of your livestock.
              </>
            }
          />

          <Section
            title={
              <>
                Why choose <EForesee />?
              </>
            }
            headline="Personalised surveillance for every production site to effectively manage the health of your livestock"
          >
            <Carousel height={"520px"}>
              <CarouselCard
                icon="/predict/predict-s5.1.png"
                title="Complete understanding"
                invertColour={true}
              >
                Every aquatic environment has a unique microbiome. We monitor
                microbial activity to make accurate predictions about disease
                outbreaks.
              </CarouselCard>
              <CarouselCard
                icon="/predict/predict-s5.2.png"
                title="Accurate predictions"
                invertColour={true}
              >
                Microbiome data collected from global aquaculture supports
                robust models.
              </CarouselCard>
              <CarouselCard
                icon="/predict/predict-s5.3.png"
                title="Actionable insights"
                invertColour={true}
              >
                <span>
                  <EForesee /> provides you the earliest opportunity to take
                  preventative action against disease outbreaks
                </span>
              </CarouselCard>
              <CarouselCard
                icon="/predict/predict-s5.4.png"
                title="Full support"
                invertColour={true}
              >
                Ongoing support as your farm achieves its full potential
              </CarouselCard>
            </Carousel>
          </Section>

          <Section
            title={
              <>
                How <EForesee /> works for you
              </>
            }
            headline="We monitor your farm's health in microscopic detail"
          >
            <CaptionIcons size="full">
              <CaptionIcon size="med" img="/predict/predict-s6.1.png">
                Esox practitioners arrive onsite and install microbial
                surveillance hardware which frequently samples your farm's
                microbiomes to provide huge quantities of biological data.
              </CaptionIcon>
              <CaptionIcon size="med" img="/predict/predict-s6.2.png">
                Potential pathogens are observed and quantified, and their
                presence is linked to stress-inducing production events that
                shift livestock welfare into high-risk zones.
              </CaptionIcon>
              <CaptionIcon size="med" img="/predict/predict-s6.3.png">
                <span>
                  Big data yields foresight and offers robust predictions on the
                  likelihood of disease outbreaks. <EForesee /> anticipates risk
                  and provides early warnings so health managers can act before
                  disease rather than react to disease.
                </span>
              </CaptionIcon>
            </CaptionIcons>
          </Section>
          <FaqSection faqs={PREDICT_FAQS} />
        </Stack>
      </main>
    </>
  );
};

Predict.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default Predict;
