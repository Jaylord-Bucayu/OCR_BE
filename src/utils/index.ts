


export function generateStudentId(): string {
    const minId = 1000; // Minimum student ID
    const maxId = 9999; // Maximum student ID
  
    // Generate a random number within the specified range
    const randomId = Math.floor(Math.random() * (maxId - minId + 1)) + minId;
  
    // Convert the random number to a string and return it as the student ID
    return randomId.toString();
  }
  