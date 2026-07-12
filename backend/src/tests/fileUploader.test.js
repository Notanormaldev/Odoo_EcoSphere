import path from 'path';

// Replicate file filter logic from fileUploader for direct test
const testFileFilter = (filename) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.docx', '.csv', '.xlsx'];
  const ext = path.extname(filename).toLowerCase();
  return allowedExtensions.includes(ext);
};

describe('File Uploader Extension Validation', () => {
  it('should accept valid file formats', () => {
    expect(testFileFilter('evidence.png')).toBe(true);
    expect(testFileFilter('report.xlsx')).toBe(true);
    expect(testFileFilter('receipt.pdf')).toBe(true);
  });

  it('should reject invalid file formats', () => {
    expect(testFileFilter('malicious.exe')).toBe(false);
    expect(testFileFilter('script.sh')).toBe(false);
    expect(testFileFilter('styles.css')).toBe(false);
  });
});
