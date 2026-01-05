import { useEffect } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { MainLayout } from "../components/main-layout";
import { gtm } from "../lib/client/gtm";
import { Hero, HeroStandardContents } from "src/components/hero";
import Box from "@mui/system/Box";
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

const PREVENT_FAQS = [
  {
    key: "prevent_faq_1",
    question: "How do I administer Aquabody Prebiotics?",
    children:
      "Aquabody prebiotics are seemlessly administered via the feed. A farmer or producer need not make any changes to their conventional husbandry practices. Our partnerships with leading feed manufacturers will ensure that Aquabody prebiotics will become widely available through your conventional feed suppliers.",
  },
  {
    key: "prevent_faq_2",
    question: "How often should I use Aquabody Prebiotics?",
    children:
      "Aquabody prebiotics are designed to support every stage of your animal's life and will be administered with every meal throughout production.",
  },
  {
    key: "prevent_faq_3",
    question:
      "Will pathogens develop antimicrobial resistance to the Aquabody Prebiotics?",
    children:
      "Unlike conventional antimicrobial chemicals, our Aquabody prebiotics are naturally occurring immune molecules that do not generate antimicrobial resistance in pathogens .",
  },
];

const Prevent: NextPage = () => {
  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  return (
    <>
      <Head>
        <title>Prevent | Esox Biologics</title>
      </Head>
      <main id="mainRoot">
        <Hero image="/prevent/prevent-hero.png">
          <HeroStandardContents
            title={
              "Sustainable feed additives that support your livestock's immune system"
            }
            subtitle={
              "Negatively modulate the presence of pathogens in your microbiome with our polypeptide prebiotics."
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
            title={"We know how to improve the health of your farm"}
            headline={`Our targeted remedies prevent infectious disease in aquaculture with no off-target effects`}
          >
            Inspired by nature, we are producing polypeptide prebiotics that
            negatively modulate the presence of pathogens within aquatic
            microbiomes and prevent their accumulation within livestock.
            <p>
              <b>Available in 2025.</b>
            </p>
            <br />
            <CaptionIcons md={3}>
              <CaptionIcon size="med" img="/prevent/prevent-s2.1.png">
                Targeted
              </CaptionIcon>
              <CaptionIcon size="med" img="/prevent/prevent-s2.2.png">
                Precise
              </CaptionIcon>
              <CaptionIcon size="med" img="/prevent/prevent-s2.3.png">
                Sustainable
              </CaptionIcon>
              <CaptionIcon size="med" img="/prevent/prevent-s2.4.png">
                Non-intrusive
              </CaptionIcon>
            </CaptionIcons>
          </CenterTextSection>
          <TextAndImageSection
            title="The need for sustainable solutions"
            headline="Indiscriminate treatments are harming your yields"
            image="/prevent/prevent-s3.png"
            columnSplit="title"
            body={`As well as producing resistant pathogens, conventional
            antimicrobials destroy beneficial microbial communities.
            Applied indiscriminately, antimicrobials disrupt the beneficial
            microorganisms that live in and around aquatic animals,
            weakening the entire ecosystem.`}
          />

          <TextAndImageSection
            title="No handling, no stress"
            headline="Seamless delivery via the feed to reduce livestock stress"
            imageFirst={true}
            image="/prevent/prevent-s4.png"
            body={`Incorporated into pellet feed and included with every meal, Aquabody
        prebiotics are administered easily, adding no additional cost to producers and ensuring
        livestock remain stress free.`}
            imageSize="large"
            columnSplit="title"
          />
          <Section
            title={<>Why choose the Aquabody™?</>}
            headline={
              <>
                Bespoke prebiotics designed to target pathogens unique to{" "}
                <span style={{ whiteSpace: "nowrap" }}>your farm</span>
              </>
            }
          >
            Aquabody molecules neutralise aquatic pathogens and interrupt their
            association with your livestock. We have Aquabody molecules for
            every phase of growth and environmental condition, from hatchery to
            grow-out and freshwater to saline. Our Aquabody formulations are
            customised to your needs, boosting the immunity of your livestock
            against their biggest threats.
            <Carousel height={"340px"}>
              <CarouselCard
                icon="/prevent/prevent-s5.1.png"
                invertColour={true}
              >
                Strengthen your livestock immune systems
              </CarouselCard>
              <CarouselCard
                icon="/prevent/prevent-s5.2.png"
                invertColour={true}
              >
                Protect beneficial microbes
              </CarouselCard>
              <CarouselCard
                icon="/prevent/prevent-s5.3.png"
                invertColour={true}
              >
                Improve livestock welfare
              </CarouselCard>
              <CarouselCard
                icon="/prevent/prevent-s5.4.png"
                invertColour={true}
              >
                Reduce antibiotic use
              </CarouselCard>
            </Carousel>
          </Section>

          <Section
            title="Targeted and sustainable remedies"
            headline="The next generation of disease prevention for your livestock"
          >
            <p>
              Aquatic livestock are most vulnerable at the earliest stages of
              life. Our initial Aquabody prebiotics are being developed to
              prevent the spread of infectious diseases in shrimp (
              <em>Litopanaeus vannamei</em>) and juvenline salmonids (
              <em>Salmo salar</em> and <em>Oncorhynchus mykiss</em>).
            </p>
            <p>
              <b>
                Our Aquabody formulations are customised to your needs, boosting
                the immunity of your livestock against their biggest threats.
              </b>
            </p>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <img width="50%" src="/prevent/prevent-s6.1.png" />
              <img width="50%" src="/prevent/prevent-s6.2.png" />
            </Box>
          </Section>

          <FaqSection faqs={PREVENT_FAQS} />
        </Stack>
      </main>
    </>
  );
};

Prevent.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default Prevent;
