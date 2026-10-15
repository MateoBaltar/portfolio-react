import { useLanguage } from '../i18n/LanguageContext';

export function Contact() {
  const { t } = useLanguage();
  const contact = t('contact');

  return (
    <section className="section">
      <h2>{contact.title}</h2>
      <div className="contact__details">
        <p>{contact.location}</p>
        <p>{contact.phone}</p>
        <p>{contact.email}</p>
      </div>

      <form
        className="contact-form"
        data-testid="contact-form"
        action="https://formsubmit.co/mateobaltar@gmail.com"
        method="POST"
      >
        <input type="hidden" name="_subject" value="Contacto Portfolio!" />
        <input
          name="name"
          type="text"
          className="feedback-input"
          placeholder={contact.formName}
          required
        />
        <input
          name="email"
          type="text"
          className="feedback-input"
          placeholder={contact.formEmail}
          required
        />
        <textarea
          name="text"
          className="feedback-input"
          placeholder={contact.formMessage}
          required
        ></textarea>
        <input type="submit" value={contact.formSubmit} />
      </form>
    </section>
  );
}
