export const adminLogic = (app,ADMINPORT) => {

    app.get('/', (req, res) => {
        res.send('')
    })

    app.listen(ADMINPORT, () => {
        console.log(`Example app listening on port ${ADMINPORT}`)
    })
}