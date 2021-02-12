import React from "react";
import Modal from "react-bootstrap/Modal";
import {Button, Form} from "react-bootstrap";

const OpolisDataModal = ({show, handleClose, docProps, setState}) => (
    <Modal show={show} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton>
            <Modal.Title>Opolis Policy Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            Your <strong>Opolis Policy Details</strong> document has been pre-populated using your <strong>Opolis account</strong>.<br/>
            <Form>
                <Form.Group>
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                        value={docProps.member.name}
                        onChange={setState('member.name')}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Trusted Person</Form.Label>
                    <Form.Control
                        value={docProps["trusted-person"].name}
                        onChange={setState('trusted-person.name')}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Private Key</Form.Label>
                    <Form.Control
                        value={docProps.wallet["private-key"]}
                        onChange={setState('wallet.private-key')}
                    />
                </Form.Group>
            </Form>
            <code>
                <strong>{docProps.member.name}</strong> is a customer of Opolis with policy #
                <strong>{docProps.benefits["term-life"]["policy-number"]}</strong>.<br />
                Life insurance coverage is held in the amount of&nbsp;
                <strong>{docProps.benefits["term-life"].amount}</strong>.<br />
            </code>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
                Close
            </Button>
            <Button variant="primary" onClick={handleClose}>
                Save Changes
            </Button>
        </Modal.Footer>
    </Modal>
)

export default OpolisDataModal