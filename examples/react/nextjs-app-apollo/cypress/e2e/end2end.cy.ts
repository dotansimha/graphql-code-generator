describe('NextJS App directory example', () => {
  it('renders server component', () => {
    cy.visit('http://localhost:3000/server-component');
    cy.get('h3').should('contain', 'A New Hope');
  });
  it('renders client component', () => {
    cy.visit('http://localhost:3000/client-component');
    cy.get('h3').should('contain', 'A New Hope');
  });
  it('renders client component with suspense', () => {
    cy.visit('http://localhost:3000/client-component/suspense');
    cy.get('h3').should('contain', 'A New Hope');
  });
});

// lol, this is a hack to make the file a module and nextjs build happy
export {};
