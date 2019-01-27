FROM node:10.15.0

WORKDIR /Users/bongkyunpark/workspace/jobstates-refactor

COPY ./ ./

RUN npm install

CMD ["/bin/bash"]
