FROM ruby:latest

ENV LC_ALL C.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US.UTF-8

RUN mkdir /website
WORKDIR /website

COPY Gemfile Gemfile
RUN gem install jekyll bundler
RUN bundle install
RUN bundle update

# RUN gem install public_suffix --version 4.0.3
# RUN gem install ffi --version 1.12.2
# RUN gem install sassc --version 2.2.1
# RUN gem install rb-fsevent --version 0.10.3
# RUN gem install kramdown --version 2.3.0
# RUN gem install rouge --version 3.17.0
