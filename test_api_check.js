
const axios = require('axios');

async function testApprovalCreation() {
    try {
        console.log('Authenticating...');
        // First log in as admin to get a token (or use a hardcoded valid token if available)
        // Adjust credentials as needed for your local setup
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@crm.com',
            password: 'admin123'
        });

        const token = loginResponse.data.token;
        console.log('Logged in, token received.');

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        // Fetch a project to get IDs
        console.log('Fetching projects...');
        const projectsRes = await axios.get('http://localhost:5000/api/projects', config);
        const project = projectsRes.data.data[0]; // Just take the first one

        if (!project) {
            console.log('No projects found to test with.');
            return;
        }

        console.log(`Using Project: ${project.name} (ID: ${project.id}, ClientID: ${project.clientId})`);

        // Test Approval Creation
        // This mirrors the params used in SubmitDeliverables.jsx
        const payload = {
            title: `TEST API: Testing Completed - ${project.name}`,
            description: "Test description from script",
            projectId: project.id,
            requestedToId: project.clientId, // This might need to be a USER ID, not a Client ID from the 'clients' table
            type: 'Stage Transition',
            status: 'Pending',
            priority: 'High'
        };

        // IMPORTANT: The backend controller expects 'requestedTo', not 'requestedToId' in the body?
        // Let's check the controller code again carefully. 
        // Controller: const { ... requestedTo ... } = req.body
        // SubmitDeliverables.jsx sent: requestedToId: selectedProject.clientId

        // Wait! The controller uses `requestedTo` but the JSX sent `requestedToId`. 
        // Let's try sending `requestedTo` as well.
        payload.requestedTo = project.clientId;

        console.log('Sending Approval Payload:', payload);

        const res = await axios.post('http://localhost:5000/api/approvals', payload, config);
        console.log('Approval Created Successfully:', res.data);

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

testApprovalCreation();
