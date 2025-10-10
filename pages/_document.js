import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link rel="icon" href="/logo/logo.png" />
          <link rel="apple-touch-icon" href="/logo/logo.png" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
          <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&family=Roboto+Condensed:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&family=Roboto+Slab:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
          <link href='https://cdn.jsdelivr.net/npm/@fullcalendar/core@6/main.css' rel='stylesheet' />
          <link href='https://cdn.jsdelivr.net/npm/@fullcalendar/daygrid@6/main.css' rel='stylesheet' />
          <link href='https://cdn.jsdelivr.net/npm/@fullcalendar/timegrid@6/main.css' rel='stylesheet' />
          <style>{`
            /* Montclair State University Typography System */
            body {
              font-family: 'Roboto', sans-serif;
              font-weight: 400;
              line-height: 1.3;
              color: #333333;
              background-color: white;
              margin: 0;
              padding: 0;
            }
            
            /* Enhanced spacing system with generous margins */
            * {
              box-sizing: border-box;
            }
            
            /* Body copy uses Roboto Slab for better readability */
            p, .body-text, .event-description, .dialog-content p {
              font-family: 'Roboto Slab', serif;
              font-weight: 400;
              line-height: 1.3;
              margin-bottom: 1rem;
            }
            
            /* Dialog titles use condensed headline style */
            h2, .dialog-title, .section-title {
              font-family: 'Helvetica Neue LT', 'Helvetica Neue', Helvetica, Arial, sans-serif;
              font-weight: 700;
              font-stretch: condensed;
              letter-spacing: 0.05em;
              line-height: 1.0;
              margin-bottom: 1.5rem;
              margin-top: 0;
            }
            
            /* Form elements with enhanced spacing */
            input, textarea, select, button {
              font-family: 'Roboto', sans-serif;
              font-weight: 400;
              margin-bottom: 0.75rem;
            }
            
            /* Headlines: tight leading (90-100%) with generous margins */
            h1, .headline, .main-title {
              line-height: 0.95;
              letter-spacing: 0.05em;
              margin-bottom: 2rem;
              margin-top: 0;
            }
            
            /* Body text: comfortable leading (120-130%) */
            .body-text, p, .description {
              line-height: 1.25;
              margin-bottom: 1rem;
            }
            
            /* Form labels and inputs with proper spacing */
            label, .form-label {
              font-family: 'Roboto Condensed', sans-serif;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              font-size: 0.875rem;
              margin-bottom: 0.5rem;
              display: block;
            }
            
            /* Status badges with enhanced spacing */
            .status-badge {
              font-size: 0.75rem;
              padding: 0.25rem 0.75rem;
              border-radius: 0.375rem;
              margin-right: 0.5rem;
              margin-bottom: 0.25rem;
            }
            
            /* Event status badges and labels */
            .status-badge, .event-status {
              font-family: 'Roboto Condensed', sans-serif;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            
            /* Calendar event titles */
            .fc-event-title, .event-title {
              font-family: 'Roboto Condensed', sans-serif;
              font-weight: 700;
            }
            
            /* Enhanced button styling with focus states */
            button {
              transition: all 0.2s ease-in-out;
              border-radius: 0.375rem;
              padding: 0.5rem 1rem;
              font-size: 0.875rem;
              font-weight: 500;
              cursor: pointer;
              border: 1px solid transparent;
            }
            
            button:focus {
              outline: 2px solid #D1190D;
              outline-offset: 2px;
            }
            
            button:hover {
              transform: translateY(-1px);
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            
            /* Form inputs with focus states */
            input, textarea, select {
              transition: all 0.2s ease-in-out;
              border-radius: 0.375rem;
              padding: 0.5rem 0.75rem;
              border: 1px solid #d1d5db;
              font-size: 0.875rem;
            }
            
            input:focus, textarea:focus, select:focus {
              outline: 2px solid #D1190D;
              outline-offset: 2px;
              border-color: #D1190D;
              box-shadow: 0 0 0 3px rgba(209, 25, 13, 0.1);
            }
            
            /* FullCalendar buttons */
            .fc-today-button,
            .fc-prev-button,
            .fc-next-button {
              background-color: #D1190D !important;
              border-color: #8a8a8d !important;
              color: white !important;
              font-family: 'Roboto Condensed', sans-serif !important;
              font-weight: 700 !important;
              text-transform: uppercase !important;
              letter-spacing: 0.05em !important;
              transition: all 0.2s ease-in-out !important;
              border-radius: 0.375rem !important;
              padding: 0.5rem 1rem !important;
            }
            .fc-today-button:hover,
            .fc-prev-button:hover,
            .fc-next-button:hover {
              background-color: #8a8a8d !important;
              transform: translateY(-1px) !important;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2) !important;
            }
            .fc-today-button:not(:disabled):active,
            .fc-prev-button:not(:disabled):active,
            .fc-next-button:not(:disabled):active {
              background-color: #99150B !important;
            }
            .fc-today-button:focus,
            .fc-prev-button:focus,
            .fc-next-button:focus {
              outline: 2px solid #D1190D !important;
              outline-offset: 2px !important;
            }
            .fc-day-today {
              background-color: #fef2f2 !important;
            }
            .fc-day-today .fc-daygrid-day-number {
              background-color: #D1190D !important;
              color: white !important;
              border-radius: 50% !important;
              width: 24px !important;
              height: 24px !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              font-family: 'Roboto Condensed', sans-serif !important;
              font-weight: 700 !important;
            }
            
            /* Responsive typography */
            @media (max-width: 768px) {
              h1, .headline, .main-title {
                font-size: 1.5rem;
                margin-bottom: 1.5rem;
              }
              
              /* Stacked title responsive sizing */
              h1 span:first-child {
                font-size: 2.75rem;
              }
              h1 span:last-child {
                font-size: 1.625rem;
              }
              
              h2, .dialog-title, .section-title {
                font-size: 1.25rem;
                margin-bottom: 1.25rem;
              }
              
              .body-text, p, .description {
                font-size: 0.875rem;
                line-height: 1.4;
              }
              
              button {
                padding: 0.625rem 1.25rem;
                font-size: 0.875rem;
              }
              
              input, textarea, select {
                padding: 0.625rem 0.875rem;
                font-size: 0.875rem;
              }
            }
            
            @media (max-width: 480px) {
              h1, .headline, .main-title {
                font-size: 1.25rem;
                margin-bottom: 1.25rem;
              }
              
              /* Stacked title responsive sizing */
              h1 span:first-child {
                font-size: 2rem;
              }
              h1 span:last-child {
                font-size: 1.5rem;
              }
              
              h2, .dialog-title, .section-title {
                font-size: 1.125rem;
                margin-bottom: 1rem;
              }
              
              .body-text, p, .description {
                font-size: 0.8125rem;
                line-height: 1.5;
              }
              
              button {
                padding: 0.5rem 1rem;
                font-size: 0.8125rem;
              }
              
              input, textarea, select {
                padding: 0.5rem 0.75rem;
                font-size: 0.8125rem;
              }
            }
          `}</style>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument