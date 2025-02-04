/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onSchedule } from "firebase-functions/v2/scheduler"
import * as admin from "firebase-admin"

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

admin.initializeApp()

exports.cleanupUnusedImages = onSchedule("every 24 hours", async (event) => {
    const storage = admin.storage()
    const firestore = admin.firestore()

    // Get all images from storage
    const [files] = await storage.bucket().getFiles({
      prefix: 'journal-images/'
    })

    // Get all journal entries
    const entries = await firestore
      .collection('journals')
      .get()

    // Create set of used image URLs
    const usedImages = new Set()
    entries.forEach(doc => {
      const content = doc.data().content
      const urls = content.match(/src="([^"]+)"/g) || []
      urls.forEach((url: string) => {
        const match = url.match(/src="([^"]+)"/)
        if (match?.[1]) usedImages.add(match[1])
      })
    })

    // Delete unused images
    for (const file of files) {
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: '03-01-2500'
      })
      
      if (!usedImages.has(url)) {
        await file.delete()
        console.log(`Deleted unused image: ${file.name}`)
      }
    }
})
