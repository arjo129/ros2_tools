# ROS2 Tools I use on a regular basis

These are ROS 2 tools that have been largely "vibe-coded" but are incredibly useful for me. 


## `ros2 sleep`

This is a command that allows one to write shell and powershell scripts that sleep for a specified amount of time.
Why not just use "sleep" you might ask? Well, ros2 actually allows you to sandbox simulation time. So for instance you could run your simulation at 2x speed and you want to sleep for 1 second in sim time before running the next command you can say:
```bash
ros2 sleep --use-sim-time 1
```
This will run the next command only after 1 second has been completed in sim time.

## `dotstream_viz`

Sometimes you may want to visualize graphviz nodes, this program accepts a string of graphviz nodes and renders them to a ros2 image stream. This is very useful for certain types of demos where we may want to stream some internal graphviz details.

To start a node run:
```bash
ros2 run dotstream_viz dotstream_node
```
The node subscribes to:
- `network` (`std.msgs.String`): A string representing the graphviz graph you want to visuallize.
- `graph_image` (`sensor_msgs.msgs.Image`): Output Image containing the graph

## `gz_introspection_agent`

This essentially provides a list of published topics and types from the gazebo simulator over a rest API.
The rest API can be used by tools to help develop web frontends. An example usecase is for instanc ein a vscode extension.
Note that currently this node is extremely inflexible as it listens on `127.0.0.1:1234` without any warning.
