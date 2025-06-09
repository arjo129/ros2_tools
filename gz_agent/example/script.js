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
    let mapping = {
		"gz.msgs.LaserScan": "sensor_msgs/msg/LaserScan",
		"gz.msgs.Twist": "geometry_msgs/msg/Twist",
		"gz.msgs.Odometry": "geometry_msgs/msg/Odometry",
		"gz.msgs.FluidPressure": "sensor_msgs/msg/FluidPressure",
		"gz.msgs.BatteryState": "sensor_msgs/msg/BatteryState",
		"gz.msgs.Image": "sensor_msgs/msg/Image",
		"gz.msgs.CameraInfo": "sensor_msgs/msg/CameraInfo",
		"gz.msgs.PointCloudPacked": "sensor_msgs/msg/PointCloud2",
		"gz.msgs.Boolean": "std_msgs/msg/Bool",
		"gz.msgs.IMU": "sensor_msgs/msg/Imu",
		"gz.msgs.Model": "sensor_msgs/msg/JointState",
		"gz.msgs.Magnetometer": "sensor_msgs/msg/MagneticField",
		"gz.msgs.NavSat" : "sensor_msgs/msg/NavSatFix",
		"gz.msgs.Clock" : "rosgraph_msgs/msg/Clock",
		"gz.msgs.Pose_V" : "tf2_msgs/msg/TFMessage"
	};

	return mapping[gzType] || null; // Return null if no direct mapping found
}

// Function to generate a single ros_gz bridge command
function generateBridgeCommand(topic, gzType, ros2Type, direction) {
    if (!ros2Type) {
        // console.warn(`No direct ROS 2 type mapping found for Gazebo type: ${gzType}. Skipping bridge for topic: ${topic}`);
        return null;
    }

    // Determine the bridge direction
    if (direction === 'GZ=>ROS') {
        var bridge_direction = '[';
    }
    else if (direction === 'ROS=>GZ') {
        var bridge_direction = ']';
    }
    else {
        var bridge_direction = '@';
    }

    // Construct the command
    return `ros2 run ros_gz_bridge parameter_bridge ${topic}@${ros2Type}${bridge_direction}${gzType}`;
}

// Function to generate a single ros_gz bridge command
function generatePythonBridgeCommand(topic, gzType, ros2Type, direction) {
    if (!ros2Type) {
        // console.warn(`No direct ROS 2 type mapping found for Gazebo type: ${gzType}. Skipping bridge for topic: ${topic}`);
        return null;
    }

    // Determine the bridge direction
    if (direction === 'GZ=>ROS') {
        var bridge_direction = '[';
    }
    else if (direction === 'ROS=>GZ') {
        var bridge_direction = ']';
    }
    else {
        var bridge_direction = '@';
    }

    // Construct the command
    return `Node(package='ros_gz_bridge', executable='parameter_bridge', arguments='${topic}@${ros2Type}${bridge_direction}${gzType}')`;
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
    const individualCommandsList = document.getElementById('individualCommandsList');

    // Clear previous commands
    individualCommandsList.innerHTML = '';

    if (commands.length === 0) {
        showMessage('info', 'No bridge commands could be generated or no topics found.');
        return;
    }

    // Populate the individual list
    commands.forEach((cmd, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = cmd.topic;
        //const codeElement = document.createElement('code');
        listItem.appendChild(document.createElement('br'));
        const directionSpan = document.createElement('span');
        directionSpan.style.marginRight = '10px';

        const directions = ['GZ=>ROS', 'ROS=>GZ', 'Bidirectional'];
        directions.forEach(direction => {
            const radioButton = document.createElement('input');
            radioButton.type = 'radio';
            radioButton.name = `direction_${index}`;
            radioButton.value = direction;
            radioButton.style.marginRight = '5px';

            const label = document.createElement('label');
            label.textContent = direction;
            label.style.marginRight = '10px';

            directionSpan.appendChild(radioButton);
            directionSpan.appendChild(label);
        });

        listItem.appendChild(directionSpan);
        //codeElement.textContent = cmd;
        //listItem.appendChild(codeElement);

        const copyBashButton = document.createElement('button');
        copyBashButton.textContent = 'Copy Bash Command';
        copyBashButton.onclick = () => {
            const direction = document.querySelector(`input[name="direction_${index}"]:checked`)?.value || 'Bidirectional';
            navigator.clipboard.writeText(generateBridgeCommand(cmd.topic, cmd.type, getRos2Type(cmd.type), direction))
                .then(() => {
                    showMessage('info', `Copied command ${index + 1} to clipboard!`);
                    setTimeout(hideMessage, 2000); // Hide message after 2 seconds
                })
                .catch(err => {
                    showMessage('error', 'Failed to copy command!');
                    console.error('Failed to copy text: ', err);
                });
        };
        listItem.appendChild(copyBashButton);

        const copyPythonLaunchButton = document.createElement('button');
        copyPythonLaunchButton.textContent = 'Copy Python Launch';
        copyPythonLaunchButton.onclick = () => {
            const direction = document.querySelector(`input[name="direction_${index}"]:checked`)?.value || 'Bidirectional';
            navigator.clipboard.writeText(generatePythonBridgeCommand(cmd.topic, cmd.type, getRos2Type(cmd.type), direction))
                .then(() => {
                    showMessage('info', `Copied command ${index + 1} to clipboard!`);
                    setTimeout(hideMessage, 2000); // Hide message after 2 seconds
                })
                .catch(err => {
                    showMessage('error', 'Failed to copy command!');
                    console.error('Failed to copy text: ', err);
                });
        };
        listItem.appendChild(copyPythonLaunchButton);
        individualCommandsList.appendChild(listItem);
    });
    // Call the function to add the syntax toggle button

    showCommandsOutput();
}


// --- Main Logic ---

async function generateBridges() {
    hideCommandsOutput();
    showMessage('loading', 'Fetching Gazebo topics and generating commands...');

    try {
        const gazeboTopics = await getGazeboTopics();
        const skippedTopics = [];

        gazeboTopics.forEach(item => {
            const ros2Type = getRos2Type(item.type);
        });

        updateCommandsDisplay(gazeboTopics);

        if (skippedTopics.length > 0) {
            showMessage('info', `Successfully generated commands. ${skippedTopics.length} topics were skipped due to unmapped Gazebo types.`);
        } else {
            showMessage('info', 'Successfully generated all bridge commands!');
        }


    } catch (error) {
        showMessage('error', `Failed to generate commands: ${error.message}. Please check the console for details and ensure the endpoint is running.`);
        hideCommandsOutput(); // Hide output on error
        console.error(error);
    }
}

// --- Event Listeners ---

document.addEventListener('DOMContentLoaded', () => {
    const generateButton = document.getElementById('generateBridgesButton');

    generateButton.addEventListener('click', generateBridges);

    // Initial state: hide output and show an introductory message
    hideCommandsOutput();
    showMessage('info', 'Click "Generate Bridge Commands" to begin.');
});
