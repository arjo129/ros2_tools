# `gz_introspection_agent`

This provides an easy way to create ros<=>gz launch files. It serves a page on localhost:1234 that can be used to retrieve a list of gazebo topics.
We then provide a simple way to copy snippets which can be included in your launch file.


To run it run:
```
ros2 run gz_introspection_agent gz_agent 
```
And then navigate to [http://localhost:1234](http://localhost:1234).