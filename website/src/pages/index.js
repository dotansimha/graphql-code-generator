import React from 'react';
import classnames from 'classnames';
import Layout from '@theme/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';
import Link from '@docusaurus/Link';

const features = [
  // {
  //   title: <>GraphQL as a Query Language</>,
  //   imageUrl: 'img/GraphQL_Logo.svg',
  //   description: (
  //     <>
  //       Use GraphQL as a query language to fetch data from your data-sources
  //       directly, without the need for a running gateway server, or any other
  //       bottleneck.
  //     </>
  //   )
  // },
  // {
  //   title: <>Any Data Source</>,
  //   imageUrl: 'img/mesh-example.png',
  //   description: (
  //     <>
  //       With GraphQL Mesh, you can use GraphQL query language to fetch from
  //       (almost) any data source, without changing the source or modify it's
  //       code.
  //     </>
  //   )
  // },
  // {
  //   title: <>Open Source</>,
  //   imageUrl: 'img/open-source.svg',
  //   description: (
  //     <>
  //       GraphQL Mesh is free and open-source, and been built with the community.
  //       You can contribute, extend and have your custom logic easily.
  //     </>
  //   )
  // }
];

function Feature({ imageUrl, title, description }) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={classnames('col col--4', styles.feature)}>
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
        className="desktop-only"
        src={`/img/hexagons/blue.svg`}
        style={{ position: 'absolute', left: '350px', top: '100px', height: '30px' }}
      />
      <img
        className="desktop-only"
        src={`/img/hexagons/pink.svg`}
        style={{ position: 'absolute', left: '100px', top: '200px', height: '150px' }}
      />
      <img
        className="desktop-only"
        src={`/img/hexagons/blue.svg`}
        style={{ position: 'absolute', left: '250px', top: '450px', height: '70px' }}
      />
      <img
        className="desktop-only"
        src={`/img/hexagons/pink.svg`}
        style={{ position: 'absolute', right: '300px', top: '150px', height: '70px' }}
      />
      <img
        className="desktop-only"
        src={`/img/hexagons/blue.svg`}
        style={{ position: 'absolute', right: '200px', top: '350px', height: '100px' }}
      />
      <div className={styles.homeSplashFade}>
        <div className="wrapper homeWrapper">{props.children}</div>
      </div>
    </div>
  );
}

function ProjectTitle() {
  return (
    <h2 className={styles.projectTitle}>
      <img src="img/gql-codegen-cover.png" />
      <small>Generate code from your GraphQL schema with a single function call</small>
    </h2>
  );
}

function Home() {
  return (
    <Layout title={`GraphQL Code Generator`} description="">
      <header>
        <SplashContainer>
          <div className={styles.inner}>
            <ProjectTitle />
            <div>
              <Link to={'#live-demo'}>Try It Out</Link>
              <Link to={`/docs/getting-started/index`}>View Docs</Link>
            </div>
          </div>
        </SplashContainer>
      </header>
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
  );
}

export default Home;
