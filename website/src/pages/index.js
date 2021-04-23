import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { ThemeProvider, Header } from 'the-guild-components';

if (ExecutionEnvironment.canUseDOM) {
  process.hrtime = () => null;
}

import React from 'react';
import classnames from 'classnames';
import Layout from '@theme/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';
import Link from '@docusaurus/Link';
import { Button } from '../components/ui/Button';
import { LiveDemo } from '../components/live-demo/LiveDemo';

const features = [
  {
    title: <>Generate Code Instantly</>,
    imageUrl: 'img/gear.svg',
    description: (
      <>
        Generate code from your GraphQL schema and GraphQL operations with a single function call regardless of your
        environment or code format.
      </>
    ),
  },
  {
    title: <>Watch For Changes</>,
    imageUrl: 'img/eye.svg',
    description: (
      <>
        Watch for changes in your GraphQL schema and operations, and automatically generate code as you go. Codegen
        easily integrates into your development workflow.
      </>
    ),
  },
  {
    title: <>Customize Easily</>,
    imageUrl: 'img/puzzle.svg',
    description: (
      <>
        One of the goals of GraphQL Codegen is to allow you to easily customize the output, and add custom behaviour
        according to your needs.
      </>
    ),
  },
  {
    title: <>And more!</>,
    imageUrl: 'img/more-options.svg',
    description: (
      <>
        You can generate your resolvers' signatures, dump schemas, model types, query builders, React Hooks, Angular
        Services, and much more!
      </>
    ),
  },
];

function Feature({ imageUrl, title, description }) {
  const imgUrl = useBaseUrl(imageUrl);

  return (
    <div className={classnames('col col--3', styles.feature)}>
      {imgUrl && (
        <div className="text--center">
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function SplashContainer(props) {
  return (
    <div className={styles.homeContainer}>
      <img
        className={styles.desktopOnly}
        src={`/img/hexagons/blue.svg`}
        style={{ position: 'absolute', left: '350px', top: '100px', height: '30px' }}
      />
      <img
        className={styles.desktopOnly}
        src={`/img/hexagons/pink.svg`}
        style={{ position: 'absolute', left: '100px', top: '200px', height: '150px' }}
      />
      <img
        className={styles.desktopOnly}
        src={`/img/hexagons/blue.svg`}
        style={{ position: 'absolute', left: '250px', top: '450px', height: '70px' }}
      />
      <img
        className={styles.desktopOnly}
        src={`/img/hexagons/pink.svg`}
        style={{ position: 'absolute', right: '300px', top: '150px', height: '70px' }}
      />
      <img
        className={styles.desktopOnly}
        src={`/img/hexagons/blue.svg`}
        style={{ position: 'absolute', right: '200px', top: '350px', height: '100px' }}
      />
      <div className={styles.homeSplashFade}>
        <div className={[styles.wrapper, styles.homeWrapper]}>{props.children}</div>
      </div>
    </div>
  );
}

function ProjectTitle() {
  return (
    <div className={styles.coverContainer}>
      <img src="img/gql-codegen-cover.png" className={styles.cover} />
      <h3 className={styles.projectTitle}>Generate code from your GraphQL schema and operations with a simple CLI</h3>
      <img
        alt="npm"
        src="https://img.shields.io/npm/v/@graphql-codegen/cli?color=%23e15799&label=cli&nbsp;version&style=for-the-badge"
      />
    </div>
  );
}

function Home() {
  return (
    <>
      <BrowserOnly>
        {() => (
          <ThemeProvider>
            <Header themeSwitch activeLink={'/open-source'} accentColor="var(--ifm-color-primary)" />
          </ThemeProvider>
        )}
      </BrowserOnly>

      <Layout title={`GraphQL Code Generator`} description="">
        <header>
          <SplashContainer>
            <div className={styles.inner}>
              <ProjectTitle />
              <div className={styles.buttonsWrapper}>
                <Button mobileHide={true}>
                  <Link to={'#live-demo'}>Try It Out Live</Link>
                </Button>
                <Button>
                  <Link to={`/docs/getting-started/index`}>View Docs</Link>
                </Button>
              </div>
            </div>
          </SplashContainer>
        </header>
        <div className={classnames(styles.liveDemo, styles.desktopOnly)}>
          <a id="live-demo" />
          <LiveDemo />
        </div>
        <main>
          {features && features.length && (
            <section className={styles.features}>
              <div className="container">
                <div className="row">
                  {features.map((props, idx) => (
                    <Feature key={idx} {...props} />
                  ))}
                </div>
              </div>
            </section>
          )}
        </main>
      </Layout>
    </>
  );
}

export default Home;
