
cmake_minimum_required(VERSION 3.8)

project(gz_introspection_agent)

find_package(gz_transport_vendor REQUIRED)
find_package(gz-transport REQUIRED)
find_package(ament_index_cpp REQUIRED)

set(GZ_TRANSPORT_VER ${gz-transport13_VERSION_MAJOR})

add_executable(gz_agent src/gz_agent.cpp)
target_link_libraries(gz_agent
  gz-transport::gz-transport
  ament_index_cpp::ament_index_cpp)

install(TARGETS
  gz_agent
  DESTINATION lib/${PROJECT_NAME})
install(DIRECTORY example/
  DESTINATION "share/${PROJECT_NAME}/resources"  # Install into share/<package_name>/resources
)
ament_package()
