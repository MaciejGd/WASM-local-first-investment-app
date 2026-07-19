front: 
	cd front-end && npm run dev

back:
	cd backend/ && \
	flask --app inv_app run
