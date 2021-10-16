# Example

I would like to create a simple example of the usecase for the bundler and what it is trying to solve. Inspired by [zbos](https://bitbucket.org/qbmt/zbos-mqtt-api/src/master/), where there are multiple asyncapi files that define one particular component. 

Consider two separate specification file that define two different interfaces. They have seperate channels and message payload for their respented interface, all bundler does is combine them together. Check the following files [audio.yml](./audio.yml), [camera.yml](./camera.yml), [base.yml](./base.yml). 
