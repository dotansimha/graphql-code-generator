import { cn, Heading, InfoCard } from '@theguild/components';

import boxSvg from './icons/box.svg';
import checkmarksSvg from './icons/checkmarks.svg';
import speedometerSvg from './icons/speedometer.svg';

export function DevExCards(props: { className?: string }) {
  return (
    <section className={cn('px-4 py-6 sm:py-12 md:px-6 lg:py-24 xl:px-[120px]', props.className)}>
      <Heading as="h3" size="md" className="text-balance text-center">
        Your chance to fully use GraphQL.
      </Heading>
      <p className="mx-auto mt-4 max-w-[700px] text-center text-green-800">
        Codegen enhances your GraphQL development with fully typed client and server code, generating robust,
        error-resistant solutions in seconds
      </p>
      <ul className="mt-6 flex flex-row flex-wrap justify-center gap-2 md:mt-16 md:gap-6">
        <InfoCard
          as="li"
          heading="Typed Queries, Mutations, and Subscriptions"
          icon={<img src={boxSvg.src} alt="" />}
          className="flex-1 rounded-2xl md:rounded-3xl"
        >
          Automate the creation of typed queries, mutations, and subscriptions for frameworks like React, Vue, Angular,
          and more.
        </InfoCard>
        <InfoCard
          as="li"
          heading="Typed GraphQL resolvers"
          icon={<img src={speedometerSvg.src} alt="" />}
          className="flex-1 basis-full rounded-2xl md:basis-0 md:rounded-3xl"
        >
          Generate typed GraphQL resolvers for any Node.js or Java GraphQL server, ensuring compatibility and
          efficiency.
        </InfoCard>
        <InfoCard
          as="li"
          heading="Fully-typed Node.js SDKs"
          icon={<img src={checkmarksSvg.src} alt="" />}
          className="flex-1 basis-full rounded-2xl md:rounded-3xl lg:basis-0"
        >
          Produce fully-typed Node.js SDKs, enhancing development with reliable, strongly typed software components.
        </InfoCard>
      </ul>
    </section>
  );
}
