describe('template spec', () => {
  it('renders everything correctly', () => {
    cy.visit('http://localhost:3000');
    cy.get('h3', { timeout: 15000 }).should('contain', 'A New Hope');
  });
});
