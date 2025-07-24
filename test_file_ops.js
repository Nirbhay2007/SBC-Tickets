import fs from 'fs';
import path from 'path';

const CARRY_DATA_FILE = path.join(process.cwd(), 'data', 'carryStats.json');

console.log('File path:', CARRY_DATA_FILE);
console.log('Current working directory:', process.cwd());

// Test basic file operations
console.log('\nTesting file operations...');

try {
    // Read current content
    console.log('1. Reading current file...');
    const currentContent = fs.readFileSync(CARRY_DATA_FILE, 'utf8');
    console.log('Current content length:', currentContent.length);
    
    // Parse and modify
    console.log('2. Parsing and modifying...');
    const data = JSON.parse(currentContent);
    data['813062368250298398'].f6 = 1;
    data['813062368250298398'].totalCarries = 1;
    
    // Write back
    console.log('3. Writing back...');
    fs.writeFileSync(CARRY_DATA_FILE, JSON.stringify(data, null, 2));
    console.log('Write successful');
    
    // Verify
    console.log('4. Verifying...');
    const newContent = fs.readFileSync(CARRY_DATA_FILE, 'utf8');
    const newData = JSON.parse(newContent);
    console.log('F6 carries:', newData['813062368250298398'].f6);
    console.log('Total carries:', newData['813062368250298398'].totalCarries);
    
} catch (error) {
    console.error('Error:', error);
}
