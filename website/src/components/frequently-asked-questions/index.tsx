import { Children, ComponentPropsWithoutRef } from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { Heading, cn } from '@theguild/components';
import Questions from './questions.mdx';

export function FrequentlyAskedQuestions({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        className,
        'flex flex-col gap-x-6 gap-y-2 px-4 py-6 text-green-1000 md:flex-row md:px-10 lg:gap-x-24 lg:px-[120px] lg:py-24'
      )}
    >
      <Questions
        components={{
          h2: (props: ComponentPropsWithoutRef<'h2'>) => <Heading as="h2" size="md" className="basis-1/2" {...props} />,
          ul: (props: ComponentPropsWithoutRef<'ul'>) => (
            <Accordion.Root asChild type="single" collapsible>
              <ul className="basis-1/2 divide-y max-xl:grow" {...props} />
            </Accordion.Root>
          ),
          li: (props: ComponentPropsWithoutRef<'li'>) => {
            const texts = Children.toArray(props.children)
              .map(child =>
                typeof child === 'object' && 'type' in child && child.type === 'p'
                  ? (child.props.children as string)
                  : null
              )
              .filter(Boolean);

            if (texts.length < 2) {
              console.error(texts);
              throw new Error('Expected a question and an answer');
            }

            const [question, answer] = texts;

            if (!question) return null;

            return (
              <Accordion.Item
                asChild
                value={question}
                className="relative pb-0 transition-all duration-500 ease-[ease] focus-within:z-10 data-[state=open]:pb-4"
              >
                <li>
                  <Accordion.Header>
                    <Accordion.Trigger className="hive-focus -mx-2 my-1 flex w-[calc(100%+1rem)] flex-row items-center justify-between rounded-xl bg-white px-2 py-3 text-left font-medium transition-colors duration-[0.8s] hover:bg-beige-100/80 md:my-2 md:py-4">
                      {question}
                      <ChevronDownIcon className="size-5 transition duration-500 ease-in [[data-state='open']_&]:[transform:rotateX(180deg)]" />
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content className="overflow-hidden bg-white text-green-800 transition-all data-[state=closed]:motion-safe:animate-accordion-up data-[state=open]:motion-safe:animate-accordion-down">
                    {answer}
                  </Accordion.Content>
                </li>
              </Accordion.Item>
            );
          },
        }}
      />
    </section>
  );
}
