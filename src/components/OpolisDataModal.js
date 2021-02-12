import React from "react";
import Modal from "react-bootstrap/Modal";
import {Button, Form} from "react-bootstrap";
import RenderTemplate from "./RenderTemplate";
import {template} from "../templates/letter.tpl";

const OpolisDataModal = ({show, showForm, handleClose, docProps, setState}) => (
    <Modal show={show} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton>
            <Modal.Title>Opolis Policy Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {showForm &&
            <>
                Your <strong>Opolis Policy Details</strong> letter has been pre-populated using data from your <strong>Opolis
                account</strong>.<br/>
                <Form>
                    <Form.Group>
                        <Form.Label>Your Name</Form.Label>
                        <Form.Control
                            value={docProps.member.name}
                            onChange={setState('member.name')}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Letter Recipient</Form.Label>
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
            </>
            }
            <RenderTemplate template={template} data={docProps} />
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