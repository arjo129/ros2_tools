project(gz_introspection_agent)
cmake_minimum_required(VERSION 3.8)

find_package(gz_transport_vendor REQUIRED)
find_package(gz-transport REQUIRED)
set(GZ_TRANSPORT_VER ${gz-transport13_VERSION_MAJOR})

add_executable(gz_agent gz_agent.cpp)
target_link_libraries(gz_agent
  gz-transport::gz-transport)

install(TARGETS
  gz_agent
  DESTINATION lib/${PROJECT_NAME})

ament_package()
