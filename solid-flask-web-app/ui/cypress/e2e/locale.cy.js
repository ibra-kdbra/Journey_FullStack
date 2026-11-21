describe('locale', () => {
  it('Switch language to japanese', () => {
    cy.visit('/')

    cy.get('h1').should('contain.text', 'This is your web application');

    cy.get('.dropdown > .btn-sm').click();
    cy.get('.menu > :nth-child(2) > .btn > .flex').click();

    cy.get('h1').should('contain.text', 'ウェブアプリケーション');
  })
})
