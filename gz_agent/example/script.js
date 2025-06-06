const API_ENDPOINT = 'http://localhost:1234/topics'; // Adjust if your endpoint is different

// --- Helper Functions ---

// Function to fetch data from the Gazebo topics endpoint
async function getGazeboTopics() {
    try {
        const response = await fetch(API_ENDPOINT);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.topics;
    } catch (error) {
        console.error("Could not fetch Gazebo topics:", error);
        throw error; // Re-throw to be caught by the calling function
    }
}

// Function to map Gazebo types to ROS 2 types
function getRos2Type(gzType) {
    // This is a simplified mapping. ros_gz handles many common types directly.
    // For less common types, you might need to find the exact ROS 2 equivalent
    // or specify a custom bridge.
    // Refer to ros_gz documentation for a comprehensive list.
    const typeMap = {
        "gz.msgs.Clock": "rosgraph_msgs/msg/Clock",
        "gz.msgs.StringMsg_V": "std_msgs/msg/String", // Common for a vector of strings
        "gz.msgs.Pose": "geometry_msgs/msg/Pose",
        "gz.msgs.CameraTrack": "gazebo_msgs/msg/CameraTrack", // Placeholder, might need custom message
        "gz.msgs.WorldStatistics": "gazebo_msgs/msg/WorldStatistics",
        "gz.msgs.Pose_V": "geometry_msgs/msg/PoseArray", // Common mapping for vector of poses
        "gz.msgs.UInt32_V": "std_msgs/msg/UInt32MultiArray", // Or similar, depending on exact use case
        "gz.msgs.Scene": "gazebo_msgs/msg/Scene", // Placeholder, might need custom message
        "gz.msgs.SerializedStepMap": "gazebo_msgs/msg/SerializedStepMap" // Placeholder, might need custom message
        // Add more mappings here based on ros_gz capabilities
    };
    return typeMap[gzType] || null; // Return null if no direct mapping found
}

// Function to generate a single ros_gz bridge command
function generateBridgeCommand(topic, gzType, ros2Type) {
    if (!ros2Type) {
        // console.warn(`No direct ROS 2 type mapping found for Gazebo type: ${gzType}. Skipping bridge for topic: ${topic}`);
        return null;
    }

    // Determine ROS 2 topic name (often the same as Gazebo topic, but can be customized)
    const ros2Topic = topic;

    // Construct the command
    return `ros_gz bridge --ros-args -r ${ros2Topic}:${topic} -t ${ros2Type}@${gzType}`;
}

// --- DOM Manipulation Functions ---

function showMessage(type, text) {
    const statusMessage = document.getElementById('statusMessage');
    statusMessage.textContent = text;
    statusMessage.className = `message ${type}`; // Update class for styling
    statusMessage.style.display = 'block';
}

function hideMessage() {
    document.getElementById('statusMessage').style.display = 'none';
}

function hideCommandsOutput() {
    document.getElementById('commandsOutput').style.display = 'none';
}

function showCommandsOutput() {
    document.getElementById('commandsOutput').style.display = 'block';
}

function updateCommandsDisplay(commands) {
    const allCommandsTextarea = document.getElementById('allCommandsTextarea');
    const individualCommandsList = document.getElementById('individualCommandsList');

    // Clear previous commands
    allCommandsTextarea.value = '';
    individualCommandsList.innerHTML = '';

    if (commands.length === 0) {
        allCommandsTextarea.value = "No bridge commands could be generated or no topics found.";
        showMessage('info', 'No bridge commands could be generated or no topics found.');
        return;
    }

    // Populate the textarea with all commands
    allCommandsTextarea.value = commands.join('\n');

    // Populate the individual list
    commands.forEach((cmd, index) => {
        const listItem = document.createElement('li');
        const codeElement = document.createElement('code');
        codeElement.textContent = cmd;
        listItem.appendChild(codeElement);

        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copy';
        copyButton.onclick = () => {
            navigator.clipboard.writeText(cmd)
                .then(() => {
                    showMessage('info', `Copied command ${index + 1} to clipboard!`);
                    setTimeout(hideMessage, 2000); // Hide message after 2 seconds
                })
                .catch(err => {
                    showMessage('error', 'Failed to copy command!');
                    console.error('Failed to copy text: ', err);
                });
        };
        listItem.appendChild(copyButton);
        individualCommandsList.appendChild(listItem);
    });

    showCommandsOutput();
}

// --- Main Logic ---

async function generateBridges() {
    hideCommandsOutput();
    showMessage('loading', 'Fetching Gazebo topics and generating commands...');

    try {
        const gazeboTopics = await getGazeboTopics();
        const bridgeCommands = [];
        const skippedTopics = [];

        gazeboTopics.forEach(item => {
            const ros2Type = getRos2Type(item.type);
            const command = generateBridgeCommand(item.topic, item.type, ros2Type);
            if (command) {
                bridgeCommands.push(command);
            } else {
                skippedTopics.push(item.topic);
            }
        });

        updateCommandsDisplay(bridgeCommands);

        if (skippedTopics.length > 0) {
            showMessage('info', `Successfully generated commands. ${skippedTopics.length} topics were skipped due to unmapped Gazebo types.`);
        } else {
            showMessage('info', 'Successfully generated all bridge commands!');
        }


    } catch (error) {
        showMessage('error', `Failed to generate commands: ${error.message}. Please check the console for details and ensure the endpoint is running.`);
        hideCommandsOutput(); // Hide output on error
    }
}

// --- Event Listeners ---

document.addEventListener('DOMContentLoaded', () => {
    const generateButton = document.getElementById('generateBridgesButton');
    const copyAllButton = document.getElementById('copyAllCommandsButton');

    generateButton.addEventListener('click', generateBridges);

    copyAllButton.addEventListener('click', () => {
        const allCommandsTextarea = document.getElementById('allCommandsTextarea');
        navigator.clipboard.writeText(allCommandsTextarea.value)
            .then(() => {
                showMessage('info', 'All commands copied to clipboard!');
                setTimeout(hideMessage, 2000); // Hide message after 2 seconds
            })
            .catch(err => {
                showMessage('error', 'Failed to copy all commands!');
                console.error('Failed to copy text: ', err);
            });
    });

    // Initial state: hide output and show an introductory message
    hideCommandsOutput();
    showMessage('info', 'Click "Generate Bridge Commands" to begin.');
});
