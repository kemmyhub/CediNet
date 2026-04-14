# CediNet 🇬🇭

CediNet is a professional salary calculator and payroll analysis tool specifically designed for employees in Ghana who receive their base salary in USD. It provides accurate, real-time conversions to Ghana Cedis (GHS) and calculates all statutory deductions according to the latest Ghana Revenue Authority (GRA) guidelines.

## Features

- **Real-time Exchange Rates**: Automatically fetches the latest USD to GHS market rates using the ExchangeRate-API.
- **Statutory Deductions**:
  - **SSNIT (5.5%)**: Calculates the mandatory employee pension contribution.
  - **PAYE Income Tax**: Implements the progressive tax bands as defined by the GRA (2024).
- **Flexible Inputs**:
  - Manually adjust your base salary in USD.
  - Override the exchange rate to match your specific bank's conversion rate.
- **Multiple Views**:
  - **Overview**: Quick summary of net pay and total deductions.
  - **Monthly**: Detailed breakdown of gross salary components and taxes.
  - **Bi-weekly**: Visualizes the standard 15th/end-of-month payment schedule.
  - **Annual**: Projects yearly earnings and total tax contributions.
- **Apple Design System**: A clean, minimal, and professional user interface inspired by modern design principles.

## Tech Stack

- **React 19**
- **TypeScript**
- **Tailwind CSS** (v4)
- **Lucide React** (Icons)
- **Motion** (Animations)

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the local dev server:
   ```bash
   npm start
   ```
3. Open the app in your browser at:
   ```text
   http://localhost:3000
   ```

## Statutory Calculation Logic

### SSNIT
The Social Security and National Insurance Trust (SSNIT) contribution is calculated as 5.5% of the gross salary.

### PAYE (Pay As You Earn)
Income tax is calculated on the taxable income (Gross Salary minus SSNIT) using the following monthly bands (GHS):
- First 490: 0%
- Next 110: 5%
- Next 130: 10%
- Next 3,166.67: 17.5%
- Next 16,000: 25%
- Next 30,520: 30%
- Exceeding 50,416.67: 35%

## Disclaimer
Calculations are based on standard statutory rates. Actual net pay may vary slightly based on specific bank charges or additional company-specific deductions. Always consult with your HR or payroll department for official figures.

---
Built with ❤️ for the Ghanaian workforce.
