import { Phone, Mail, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export default function TopHeader() {
  return (
    <div className="top-header">
      <div className="container">
        <div className="top-header-content">
          <div className="contact-info">
            <div className="contact-item">
              <Phone size={16} className="contact-icon" />
              <span>+1 (123) 456-7890</span>
            </div>
            <div className="contact-item">
              <Mail size={16} className="contact-icon" />
              <span>info@Motovia.com</span>
            </div>
          </div>
          <div className="social-links">
            <a href="#" className="social-link" aria-label="Facebook">
              <Facebook size={18} />
            </a>
            <a href="#" className="social-link" aria-label="Twitter">
              <Twitter size={18} />
            </a>
            <a href="#" className="social-link" aria-label="Instagram">
              <Instagram size={18} />
            </a>
            <a href="#" className="social-link" aria-label="LinkedIn">
              <Linkedin size={18} />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
