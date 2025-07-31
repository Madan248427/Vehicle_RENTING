import React from "react";
import { Phone, Mail, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import styles from "./TopHeader.module.css";

export default function TopHeader() {
  return (
    <div className={styles.topHeader}>
      <div className={styles.container}>
        <div className={styles.topHeaderContent}>
          <div className={styles.contactInfo}>
            <div className={styles.contactItem}>
              <Phone size={16} className={styles.contactIcon} />
              <span>+1 (123) 456-7890</span>
            </div>
            <div className={styles.contactItem}>
              <Mail size={16} className={styles.contactIcon} />
              <span>info@Motovia.com</span>
            </div>
          </div>
          <div className={styles.socialLinks}>
            <a href="#" className={styles.socialLink} aria-label="Facebook">
              <Facebook size={18} />
            </a>
            <a href="#" className={styles.socialLink} aria-label="Twitter">
              <Twitter size={18} />
            </a>
            <a href="#" className={styles.socialLink} aria-label="Instagram">
              <Instagram size={18} />
            </a>
            <a href="#" className={styles.socialLink} aria-label="LinkedIn">
              <Linkedin size={18} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
