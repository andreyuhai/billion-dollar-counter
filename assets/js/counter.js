export default function toggleCounter() {
	let hideCounterElem = document.getElementById("foo")

	hideCounterElem.addEventListener("click", () => {
		let counterDiv = document.getElementById("counter")

		if (counterDiv.style.display == "none") {
			counterDiv.style.removeProperty("display")
		} else {
			counterDiv.style.display = "none";
		}
	});
}

toggleCounter();
