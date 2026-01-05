import { useEffect } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { MainLayout } from "../../components/main-layout";
import { gtm } from "../../lib/client/gtm";
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
import { calendlyConfig } from "src/public-config";
import Stack from "@mui/system/Stack";

const ENVIRONMENT_FAQS = [
  {
    key: "environment_faq_1",
    question: "How long do the results take?",
    children:
      "Once received and processed in our lab, results are returned within 72 hours.",
  },
  {
    key: "environment_faq_2",
    question: "Do you offer bulk buy deals?",
    children:
      "Yes, package deals are available on request with significant discounts available.",
  },
  {
    key: "environment_faq_3",
    question: "What happens if you detect a notifiable disease?",
    children:
      "We are never able to suspect disease based solely on the detection of DNA or RNA belonging to a notifiable pathogen. The responsibility of suspecting disease will always remain with the producer, health manager or veterinarian working onsite with the livestock. Our data will only support your decision-making process.",
  },
];

const DetectEnvironment: NextPage = () => {
  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  return (
    <>
      <Head>
        <title>Detect - Environment | Esox Biologics</title>
      </Head>
      <main id="mainRoot">
        <Hero image="/detect-environment/detectEnvironment-hero.png">
          <HeroStandardContents
            title={
              "Total microbiome surveillance for your unique aquatic enviroment"
            }
            subtitle={
              "Regular microbiome monitoring provides robust disease prevention insights with no bias"
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
          <TextAndImageSection
            title={"There's no prevention without early detection"}
            headline={
              "Environment specific insights exposing pathogens before they emerge"
            }
            image="/detect-environment/detect-enviro-s2.png"
            columnSplit="title"
            body={
              <>
                Detect Environment sequences environmental DNA (eDNA) to assess
                and monitor the organisms that threaten the welfare of your
                livestock. By exposing previously hidden microbial threats, we
                provide unrivalled disease prevention capabilities.
              </>
            }
          ></TextAndImageSection>
          <CenterTextSection title="" headline="One sample every week">
            Regular, long-term monitoring is the most effective way of detecting
            detrimental changes in your environment's unique microbiome. Threats
            are identified and monitored without harming livestock, enabling
            preventative husbandry and the application of prophylactic remedies.
            <CaptionIcons>
              <CaptionIcon
                size="med"
                img="/detect-environment/detect-enviro-s3.1.png"
              >
                Pathogen presence
              </CaptionIcon>
              <CaptionIcon
                size="med"
                img="/detect-environment/detect-enviro-s3.2.png"
              >
                Pathogen abundance
              </CaptionIcon>
              <CaptionIcon
                size="med"
                img="/detect-environment/detect-enviro-s3.3.png"
              >
                Disease risk
              </CaptionIcon>
              <CaptionIcon
                size="med"
                img="/detect-environment/detect-enviro-s3.4.png"
              >
                Benthic scores
              </CaptionIcon>
              <CaptionIcon
                size="med"
                img="/detect-environment/detect-enviro-s3.5.png"
              >
                Water quality
              </CaptionIcon>
              <CaptionIcon
                size="med"
                img="/detect-environment/detect-enviro-s3.6.png"
              >
                Biofilter stability
              </CaptionIcon>
            </CaptionIcons>
          </CenterTextSection>

          <Section
            title={"Your best prevention tool"}
            headline={"Enhance your husbandry with Detect Environment"}
          >
            <Carousel height="540px">
              <CarouselCard
                title="Discover hidden threats"
                icon={"/detect-environment/detect-enviro-s4.1.png"}
              >
                Detect organisms in your aquatic microbiome that are ignored by
                conventional diagnostic services.
              </CarouselCard>
              <CarouselCard
                title="Increase your diagnostic accuracy"
                icon={"/detect-environment/detect-enviro-s4.2.png"}
              >
                Make informed decisions with intuitive microbiome reports sent
                to your mobile.
              </CarouselCard>
              <CarouselCard
                icon="/detect-environment/detect-enviro-s3.3.png"
                title="Improve your livestock welfare"
              >
                Non-intrusive monitoring of hidden environmental threats leaves
                your livestock stress free.
              </CarouselCard>
              <CarouselCard
                icon="/detect-environment/detect-enviro-s3.4.png"
                title="Implement effective preventative husbandry techniques"
              >
                Identify every potential pathogen within the environment before
                disease manifests.
              </CarouselCard>
            </Carousel>
          </Section>

          <FaqSection faqs={ENVIRONMENT_FAQS} />
        </Stack>
      </main>
    </>
  );
};

DetectEnvironment.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default DetectEnvironment;
