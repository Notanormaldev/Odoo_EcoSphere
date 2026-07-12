describe('Carbon Emissions Calculations', () => {
  it('should correctly calculate CO2 equivalent based on quantity and factor', () => {
    const quantity = 1500; // e.g. 1500 kWh electricity
    const factor = 0.85; // 0.85 kg CO2e / kWh
    const co2Equivalent = quantity * factor;

    expect(co2Equivalent).toBe(1275);
  });

  it('should correctly sum total emissions for a list of transactions', () => {
    const transactions = [
      { co2Equivalent: 1250 },
      { co2Equivalent: 340.5 },
      { co2Equivalent: 609 }
    ];

    const totalEmissions = transactions.reduce((acc, curr) => acc + curr.co2Equivalent, 0);
    expect(totalEmissions).toBe(2199.5);
  });
});
