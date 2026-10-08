/**
 * Everything a story (src/content/stories/<lang>/<id>.mdx) may use WITHOUT importing it.
 * Adding a component here makes it available to every story. Keep this list = docs/COMPONENTS.md groups
 * primitives, media, blocks, project, lists, themes.
 */
import CategoryTick from '../components/primitives/CategoryTick.astro';
import CopyText from '../components/primitives/CopyText.astro';
import Counter from '../components/primitives/Counter.astro';
import Draft from '../components/primitives/Draft.astro';
import EvidenceLink from '../components/primitives/EvidenceLink.astro';
import ExternalLink from '../components/primitives/ExternalLink.astro';
import GoLink from '../components/primitives/GoLink.astro';
import Mark from '../components/primitives/Mark.astro';
import MetaLine from '../components/primitives/MetaLine.astro';
import MetaList from '../components/primitives/MetaList.astro';
import Quote from '../components/primitives/Quote.astro';
import RoleTag from '../components/primitives/RoleTag.astro';
import StatusTag from '../components/primitives/StatusTag.astro';
import Callout from '../components/primitives/Callout.astro';
import MediaFrame from '../components/media/MediaFrame.astro';
import ImageCaption from '../components/media/ImageCaption.astro';
import VideoEmbed from '../components/media/VideoEmbed.astro';
import Figure from '../components/media/Figure.astro';
import FrameStepper from '../components/media/FrameStepper.astro';
import BeforeAfter from '../components/media/BeforeAfter.astro';
import Stage from '../components/media/Stage.astro';
import Plate from '../components/media/Plate.astro';
import AttributionBlock from '../components/blocks/AttributionBlock.astro';
import ContributionBlock from '../components/blocks/ContributionBlock.astro';
import ConstraintBlock from '../components/blocks/ConstraintBlock.astro';
import OutcomeBlock from '../components/blocks/OutcomeBlock.astro';
import ProcessLine from '../components/blocks/ProcessLine.astro';
import Timeline from '../components/blocks/Timeline.astro';
import Retrospective from '../components/blocks/Retrospective.astro';
import ClaimLedger from '../components/blocks/ClaimLedger.astro';
import Trace from '../components/blocks/Trace.astro';
import CodeExcerpt from '../components/blocks/CodeExcerpt.astro';
import SplitScroll from '../components/blocks/SplitScroll.astro';
import ProjectHeader from '../components/project/ProjectHeader.astro';
import ProjectContext from '../components/project/ProjectContext.astro';
import Section from '../components/shell/Section.astro';
import SectionHeader from '../components/shell/SectionHeader.astro';
import PhotoCard from '../components/media/PhotoCard.astro';
import IsoObject from '../components/media/IsoObject.astro';
import SketchReveal from '../components/media/SketchReveal.astro';
import PRCard from '../components/project/PRCard.astro';
import RefBoard from '../components/project/RefBoard.astro';
import FallbackNotice from '../components/primitives/FallbackNotice.astro';
import Readout from '../components/primitives/Readout.astro';
import FlowDiagram from '../components/media/FlowDiagram.astro';
import ScrubFrames from '../components/media/ScrubFrames.astro';
import Inspector from '../components/blocks/Inspector.astro';
import ScrollStepper from '../components/blocks/ScrollStepper.astro';

export const storyComponents = {
  CategoryTick, CopyText, Counter, Draft, EvidenceLink, ExternalLink, GoLink, Mark, MetaLine, MetaList, Quote, RoleTag, StatusTag, Callout,
  MediaFrame, ImageCaption, VideoEmbed, Figure, FrameStepper, BeforeAfter, Stage, Plate,
  AttributionBlock, ContributionBlock, ConstraintBlock, OutcomeBlock, ProcessLine, Timeline, Retrospective, ClaimLedger, Trace, CodeExcerpt, SplitScroll,
  ProjectHeader, ProjectContext, Section, SectionHeader, PhotoCard, IsoObject, SketchReveal, PRCard, RefBoard, FallbackNotice,
  Readout, FlowDiagram, ScrubFrames, Inspector, ScrollStepper
};
