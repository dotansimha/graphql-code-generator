describe('template spec', () => {
  it('renders everything correctly', () => {
    cy.visit('http://localhost:3000');
    cy.get('.App').should('contain', 'I am speed');
    cy.get('.App').should('not.contain', 'I am slow');

    cy.wait(5000);
    cy.get('.App').should('contain', 'I am slow');
    cy.get('.App').should('contain', 'I am slow inlined fragment');
  });
});
