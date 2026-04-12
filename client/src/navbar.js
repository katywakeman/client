import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import './navbar.css';

function Navigation() {
  return (
    <Navbar expand="lg" className="navbar">
      <div className="navbar-inner">
        <Navbar.Brand href="#home" aria-label="KCL Map home">
          <img
            src="/kcl_logo.png"
            width="60"
            height="50"
            className="d-inline-block align-top"
            alt="King's College London logo"
            style={{ marginRight: '10px' }}
          />
          <span className="title">KCL Map</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" aria-label="Toggle navigation" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Button href="#login" className="login-btn" aria-label="Log in to KCL Map">Login</Button>
          </Nav>
        </Navbar.Collapse>
      </div>
    </Navbar>
  );
}

export default Navigation;