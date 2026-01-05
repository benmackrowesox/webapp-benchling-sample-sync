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

const LIVESTOCK_FAQS = [
  {
    key: "livestock_faq_1",
    question: "How long do the results take?",
    children:
      "Once we receive and prepare your samples, a custom report will be returned to your personal portal within 72 hours.",
  },
  {
    key: "livestock_faq_2",
    question: "Do you offer bulk buy deals?",
    children:
      "Yes, package deals are available on request with significant discounts available.",
  },
  {
    key: "livestock_faq_3",
    question: "What happens if you detect a notifiable disease?",
    children:
      "We are never able to suspect disease based solely on the detection of DNA or RNA belonging to a notifiable pathogen. The responsibility of suspecting disease will always remain with the producer, health manager or veterinarian working onsite with the livestock. Our data will only support your decision-making process.",
  },
];

const Livestock: NextPage = () => {
  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  return (
    <>
      <Head>
        <title>Detect - Livestock | Esox Biologics</title>
      </Head>
      <main id="mainRoot">
        <Hero image="/detect-livestock/detectLivestock-hero.png">
          <HeroStandardContents
            title={
              "Rapidly screen your livestock's microbiome and detect all potential pathogens"
            }
            subtitle={"No amplification, no bias, no misdiagnosis"}
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
            title={"Our novel approach to pathogen detection"}
            headline={
              "Eliminate ambiguity in your decision making with total resolution of every microorganism"
            }
            image="/detect-livestock/detect-live-s2.png"
            columnSplit="title"
            body={
              <>
                This is the first ever unbiased diagnostic tool for aquatic
                veterinary medicine, providing unrivalled insights into the
                cause of disease. We screen tissue and swab samples to identify
                all potential pathogens infecting your livestock. We compile
                detailed reports highlighting relative abundance of each
                organism, quantifying risk, and offering effective treatment
                strategies.
              </>
            }
          />
          <CenterTextSection title="" headline="1 sample, 1 test, all of this:">
            <CaptionIcons>
              <CaptionIcon
                size="med"
                img="/detect-livestock/detect-live-s3.1.png"
              >
                Strain-differentiation
              </CaptionIcon>
              <CaptionIcon
                size="med"
                img="/detect-livestock/detect-live-s3.2.png"
              >
                Secondary infections
              </CaptionIcon>
              <CaptionIcon
                size="med"
                img="/detect-livestock/detect-live-s3.3.png"
              >
                Antibiotic resistance profiles
              </CaptionIcon>
              <CaptionIcon
                size="med"
                img="/detect-livestock/detect-live-s3.4.png"
              >
                Microbiome metabolic activity
              </CaptionIcon>
              <CaptionIcon
                size="med"
                img="/detect-livestock/detect-live-s3.5.png"
              >
                Optimal treatment strategy
              </CaptionIcon>
            </CaptionIcons>
          </CenterTextSection>

          <Section
            title={"Every molecule, every organism"}
            headline={
              <>
                Enhance your diagnostic and treatment decisions with{" "}
                <span style={{ whiteSpace: "nowrap" }}>Detect Livestock</span>
              </>
            }
          >
            With the power of metagenomics, we can offer orders of magnitude
            more data than metabarcoding or qPCR methods. The data is presented
            in an easy to understand report that is accessible on both desktop
            and mobile.
            <Carousel height="340px">
              <CarouselCard
                icon="/detect-livestock/detect-live-s4.1.png"
                invertColour={false}
              >
                Detect causative agents with more accuracy
              </CarouselCard>
              <CarouselCard
                icon="/detect-livestock/detect-live-s4.2.png"
                invertColour={false}
              >
                Rapid confirmation to implement treatments faster
              </CarouselCard>
              <CarouselCard
                icon="/detect-livestock/detect-live-s4.3.png"
                invertColour={false}
              >
                Contextualise disease within total microbiomes
              </CarouselCard>
              <CarouselCard
                icon="/detect-livestock/detect-live-s4.4.png"
                invertColour={false}
              >
                Full understanding of the data you receive
              </CarouselCard>
            </Carousel>
          </Section>

          <FaqSection faqs={LIVESTOCK_FAQS} />
        </Stack>
      </main>
    </>
  );
};

Livestock.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default Livestock;
