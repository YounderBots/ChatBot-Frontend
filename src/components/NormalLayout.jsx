import { Card, Container } from 'react-bootstrap'

const NormalLayout = ({ children }) => {
    return (
        <Container fluid className="h-100 d-flex flex-column overflow-auto shadow-none">
            <Card className=" shadow-none rounded-4  ">
                <Card.Body className="">
                    {children}
                </Card.Body>
            </Card>
        </Container>
    )
}

export default NormalLayout
