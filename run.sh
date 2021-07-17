# t: threads, c: connections, d: duration, s: script
wrk -t100 -c100 -d1s -spost.lua http://localhost:3000/jobs-normal